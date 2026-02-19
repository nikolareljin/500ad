#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_FILE="$ROOT_DIR/VERSION"
NEW_VERSION="${1:-}"

if [[ -z "$NEW_VERSION" ]]; then
  echo "Usage: $0 <X.Y.Z>" >&2
  exit 2
fi

if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version: $NEW_VERSION (expected X.Y.Z)" >&2
  exit 2
fi

printf '%s\n' "$NEW_VERSION" > "$VERSION_FILE"

cat > "$ROOT_DIR/assets/version.js" <<EOT
// Generated from VERSION. Update with: ./scripts/version_set.sh <semver>
window.APP_VERSION = '$NEW_VERSION';
EOT

replace_in_file() {
  local sed_expr="$1"
  local target_file="$2"
  local tmp_file
  tmp_file="$(mktemp "${target_file}.tmp.XXXXXX")"
  sed -E "$sed_expr" "$target_file" > "$tmp_file"
  mv "$tmp_file" "$target_file"
}

replace_in_file "s/\*\*Version [0-9]+\.[0-9]+\.[0-9]+\*\*/**Version ${NEW_VERSION}**/" "$ROOT_DIR/README.md"
replace_in_file "s/version: '[0-9]+\.[0-9]+\.[0-9]+'/version: '${NEW_VERSION}'/" "$ROOT_DIR/js/state.js"

echo "Version synchronized to $NEW_VERSION"
