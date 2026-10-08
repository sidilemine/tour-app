# Private GitHub backup — 8 October 2026

Sidi authorized uploading the project to GitHub and explicitly requested inclusion of diagnostic traces. The [repository](https://github.com/sidilemine/tour-app) is private. All three local branches and their reachable source history are uploaded; `codex/local-tour-generation` is the default branch. The four project-related Word documents containing owner comments are included unchanged in Git. The unrelated Orange research document remains local.

The release tag identifies source commit `0aeb43a7fc9d5952607233466d99523aab93b46c`. The [upload receipt](github-backup/2026-10-08-upload.json) records publication, asset hashes and all three verified branch identities; the subsequent documentation receipt commit does not change that snapshot.

## Archive contents

The [backup release](https://github.com/sidilemine/tour-app/releases/tag/backup-2026-10-08) supplements the source checkout with the normally ignored working data. **Published privately; all six remote asset byte counts and GitHub SHA-256 digests match the local files.** It is a backup snapshot, not a new installed app or a claim of physical acceptance.

| Asset | Files | Bytes |
| --- | ---: | ---: |
| `tour-diagnostic-traces.zip` | 2,319 | 837,335,464 |
| `tour-generation-data.zip` | 2,149 | 317,085,159 |
| `tour-build-artifacts.zip` | 292 | 1,345,013,140 |

The three archives contain 4,760 files and total 2,499,433,763 bytes. Their original payloads total 3,844,532,842 bytes. Entries retain repository-relative paths.

- `tour-diagnostic-traces.zip`: phone logs, explicit location traces, screenshots, exported observations, recorded audio, app state/database captures and diagnostic helpers. Raw diagnostic location data is retained under the owner's explicit instruction.
- `tour-generation-data.zip`: successful and failed runs, briefs, phase artifacts, source/evidence receipts, per-agent usage ledgers, generated packages/audio and the dated local map snapshot.
- `tour-build-artifacts.zip`: retained self-contained/development APKs, historical builds, audio outputs and build verification artifacts.
- `backup-manifest.json`: per-file sizes, original/export SHA-256 values, exclusions and original archive warnings.
- `backup-summary.json` and `SHA256SUMS.txt`: compact inventory and archive checksums.

Authentication stores, signing files, reinstallable dependencies/toolchains, Python caches and macOS metadata are excluded. The existing source-history credential scan examined 1,758 blobs (125,242,323 bytes) with no findings. The newly staged project review and backup documents passed a separate credential review. The archive scan also inspected readable nested TAR/ZIP/APK files and project Word XML for current authentication values and credential patterns. No included file required redaction; originals are unchanged. Pattern review is not proof about arbitrary information encoded in pixels.

Three original 55-byte captures named `.tar` were not readable TAR archives. They are preserved unchanged as diagnostic evidence, with their condition recorded in the manifest: `diagnostics/four-case-prep-2026-09-15/edge-active.tar`, `diagnostics/hampstead-handoff-2026-09-21/before.tar` and `diagnostics/short-a-2026-09-15/before-app.tar`. No valid app capture was substituted for these failed captures. Each newly created backup ZIP passed complete CRC/readback verification.

## Restore into a fresh checkout

Authenticate GitHub CLI with an account that can access the private repository, then use a new directory:

```sh
git -c credential.helper= -c 'credential.helper=!gh auth git-credential' clone https://github.com/sidilemine/tour-app.git tour-app-restored
mkdir tour-app-backup-download
gh release download backup-2026-10-08 --repo sidilemine/tour-app --dir tour-app-backup-download
cd tour-app-backup-download
shasum -a 256 -c SHA256SUMS.txt
cd ../tour-app-restored
unzip -n ../tour-app-backup-download/tour-diagnostic-traces.zip
unzip -n ../tour-app-backup-download/tour-generation-data.zip
unzip -n ../tour-app-backup-download/tour-build-artifacts.zip
```

The archives do not supply a working authentication session or native toolchain. Follow the existing [app setup](../README.md#development-setup-on-this-mac) and [factory setup](content/generation/factory/README.md), reinstall dependencies and sign in afresh if resuming generation. APK/media backup does not establish that this factory tour was imported or listened to on the phone.
