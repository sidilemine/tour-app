# Reviewing a batch of phone exports

Prepared 13 September 2026. This is an engineer tool on the Mac; nothing new needs installing on the phone. Sidi can keep saving both results and diagnostics after each attempt using the existing guide.

Copy the deliberately exported JSON files into an ignored local directory, preserving originals. Then run:

```sh
node --import tsx tools/review-test-exports.ts diagnostics/my-test-batch > diagnostics/my-test-batch-report.json
```

Keep the output outside the input folder. It includes filenames, attempt IDs and timestamps: keep it private even though notes and coordinates are excluded. There is no upload or phone modification. Run against one folder, without recursion; regular JSON files only, no symlinks, maximum 1,000 files, 32 MiB per file and 256 MiB per batch. Split a larger batch. Read/parse errors are retained in the report; invalid exports, failed replays and conflicting completed attempts return exit code 1. Missing evidence appears as warnings and still needs review, even with exit code 0.

The report:

- Deduplicates identical completed attempts across cumulative result snapshots, retaining all source filenames. Conflicting copies stay flagged; it does not select a preferred observation or rewrite the originals.
- Lists diagnostic replay results, transition counts and discontinuity segments. Route fixture JSON files are ignored as non-test exports. An export without transitions is explicitly identified.
- Suggests diagnostic candidates only when source ID and fixture identity match the attempt, export time is after completion, and at least one transition falls within its time window. An attempt spanning changed build/fixture identities requires manual review.
- Counts snapshots containing unfinished notes separately. An older unfinished snapshot does not establish that an attempt is still active now.
- Keeps every observation subject to review. A candidate is not proof of full coverage; several cumulative log exports may all be candidates. There is no automatic acceptance flag.

After intake, read the actual notes and match build variant, device, route version, walk-start context and conditions. Check that the export covers the relevant interval without truncation or unexplained gaps. Source ID alone does not distinguish development and self-contained execution, and the current diagnostic envelope does not record the build variant. Establish that from the journal and installation record. Review native logs and physical observations for locking, genuine silence, audible completion, interruption/hold behavior and recovery. A replay on the current policy may reject valid older-policy data; preserve the original and investigate under its recorded revision.

Use `node --import tsx tools/replay.ts <private-diagnostic.json>` for an individual replay failure. Record sanitized conclusions in the [M1 result record](test-results/M1.md) and update the [phone checklist](PHONE-CHECKS.md). Do not replace an earlier failure with a later pass or count the same attempt twice. The complete [roadmap acceptance criteria](../ROADMAP.md) remain the authority.
