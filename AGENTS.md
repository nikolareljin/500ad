# 500 A.D. — Project Guidelines

This file overrides and extends the workspace-level `AGENTS.md` for the `500ad/` project specifically.

## Version Management — REQUIRED before every PR

**Always run the version sync script before opening or updating a PR:**

```bash
./scripts/version_set.sh "X.Y.Z"
```

This is the single command that keeps all version references in sync:
- `VERSION` — canonical semver source
- `assets/version.js` — runtime version exposed as `window.APP_VERSION`
- `README.md` — the `**Version X.Y.Z**` line in the footer

Never manually edit those files to change the version. Always go through `version_set.sh`.

After running it, verify with:

```bash
./scripts/check_release_version.sh
```

CI runs this check on every PR targeting `main`. A failure here means one of the version files is out of sync — fix it by running `version_set.sh` again and committing the result.

### Release branch naming

Release branches must follow `release/X.Y.Z` where `X.Y.Z` matches the value in `VERSION`. The CI check enforces this.

## Tech Stack

Vanilla JS + HTML5 Canvas, no build step. Open `index.html` directly or via `./run`.

## Script Reference

| Script | Purpose |
|---|---|
| `./run` | Start local server and open browser |
| `./scripts/version_set.sh X.Y.Z` | Bump version across all files |
| `./scripts/check_release_version.sh` | Verify all version files are in sync |
| `./scripts/tag_release.sh` | Create annotated git release tag from `VERSION` |
| `./scripts/update.sh` | Update `scripts/script-helpers` submodule |
