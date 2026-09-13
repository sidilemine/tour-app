# Public landmark lookups

Four bounded queries to the public Nominatim service, 13 September 2026, cached locally with query/URL/date and provider response. OpenStreetMap contributors; the response's licence URL records the ODbL attribution. These are public landmarks, not Sidi's private trace. Requests used an identifying user agent and were spaced over one second apart.

- `station-geocode.json`: the first result is a station building; the second is a bus stop. Use the first only as a landmark centroid.
- `church-geocode.json`: St Mary at Finchley, place of worship, landmark centroid only.
- `house-geocode.json`: no results. Retained so the failed query is not mistaken for absent research.
- `avenue-house-geocode.json`: refined query. The first result is Avenue House in Finchley; another Avenue House and a cafe are not interchangeable visitor waypoints.

No safe entrance, standing area, orientation, step-free route or public access is inferred from these records. The six-stop manifest deliberately has no visitor coordinates or invented route geometry. Other landmark coordinates remain unknown.
