#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VERSION="$(tr -d ' \t\n\r' < VERSION)"

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "VERSION is invalid: $VERSION" >&2
  exit 1
fi

grep -Fq "window.APP_VERSION = '$VERSION';" assets/version.js || {
  echo "assets/version.js is not synced to VERSION=$VERSION" >&2
  exit 1
}

grep -Fq "**Version $VERSION**" README.md || {
  echo "README version line is not synced to VERSION=$VERSION" >&2
  exit 1
}

grep -Fq "const SAVE_VERSION = '$VERSION';" js/state.js || {
  echo "Save format version in js/state.js is not synced to VERSION=$VERSION" >&2
  exit 1
}

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" =~ ^release/([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
  branch_version="${BASH_REMATCH[1]}"
  if [[ "$branch_version" != "$VERSION" ]]; then
    echo "Release branch/version mismatch: branch=$branch version=$VERSION" >&2
    exit 1
  fi
fi

echo "Version check passed: $VERSION"
