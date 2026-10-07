"""Prepare a bounded, immutable read-only authoring snapshot from a public OSM extract."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import osmium


class Extract(osmium.SimpleHandler):
    def __init__(self, bounds):
        super().__init__()
        self.bounds = bounds
        self.elements = []

    def inside(self, lat, lon):
        west, south, east, north = self.bounds
        return west <= lon <= east and south <= lat <= north

    def node(self, node):
        if node.tags and self.inside(node.location.lat, node.location.lon):
            self.elements.append(dict(type="node", id=node.id, lat=node.location.lat,
                                      lon=node.location.lon, tags=dict(node.tags)))

    def way(self, way):
        if not way.tags:
            return
        points = [dict(lat=n.lat, lon=n.lon) if n.location.valid() else None for n in way.nodes]
        if any(p and self.inside(p["lat"], p["lon"]) for p in points):
            # Keep gaps rather than inventing segments across unavailable/outside vertices.
            points = [p if p and self.inside(p["lat"], p["lon"]) else None for p in points]
            self.elements.append(dict(type="way", id=way.id, tags=dict(way.tags), geometry=points))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--bounds", required=True)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--md5", type=Path, required=True)
    args = parser.parse_args()
    bounds = [float(v) for v in args.bounds.split(",")]
    assert len(bounds) == 4 and bounds[0] < bounds[2] and bounds[1] < bounds[3]
    assert (bounds[2] - bounds[0]) <= .2 and (bounds[3] - bounds[1]) <= .2
    assert not args.output.exists(), "Existing snapshots are immutable; choose a new output"
    assert args.source_url.startswith("https://download.geofabrik.de/") and args.source_url.endswith(".osm.pbf")
    sha, md5 = hashlib.sha256(), hashlib.md5()
    with args.input.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            sha.update(block)
            md5.update(block)
    assert md5.hexdigest() == args.md5.read_text().split()[0], "Downloaded extract checksum mismatch"
    with osmium.io.Reader(str(args.input)) as reader:
        data_at = reader.header().get("osmosis_replication_timestamp")
    assert data_at, "Extract data timestamp is required"
    handler = Extract(bounds)
    handler.apply_file(str(args.input), locations=True)
    assert 0 < len(handler.elements) <= 50000
    value = dict(schemaVersion=1, sourceUrl=args.source_url, sourceSha256=sha.hexdigest(),
                 sourceMd5=md5.hexdigest(), sourceBytes=args.input.stat().st_size,
                 preparedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                 mapDataAt=data_at, bounds=bounds, elements=handler.elements,
                 limitation="Local OSM nodes/ways only; relations omitted. Extent-edge geometry has explicit gaps. Current access and physical clearance remain unverified.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("x") as output:
        json.dump(value, output, separators=(",", ":"))
        output.write("\n")
    print(json.dumps({"elements": len(handler.elements), "mapDataAt": data_at,
                      "snapshotSha256": hashlib.sha256(args.output.read_bytes()).hexdigest(),
                      "sourceSha256": sha.hexdigest(), "bytes": args.output.stat().st_size}))


if __name__ == "__main__":
    main()
