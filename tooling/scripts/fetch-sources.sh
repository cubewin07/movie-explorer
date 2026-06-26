#!/usr/bin/env bash
#
# fetch-sources.sh
#
# Reproduces the agent skill upstream clones under tooling/sources/github/.
# These clones are intentionally NOT committed (large, regenerable). This script
# clones each repo and checks out a pinned commit so every machine/CI gets the
# exact same source tree the skill wrappers were verified against.
#
# It also restores tooling/config dependencies (node_modules) from the committed
# lockfile.
#
# Usage:
#   ./tooling/scripts/fetch-sources.sh            # clone/update all sources
#   ./tooling/scripts/fetch-sources.sh --no-deps  # skip the config npm install
#
# Re-running is safe (idempotent): existing clones are fetched and reset to the
# pinned SHA.

set -euo pipefail

# Resolve repo root from this script's location (scripts live in tooling/scripts).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCES_DIR="$REPO_ROOT/tooling/sources/github"
CONFIG_DIR="$REPO_ROOT/tooling/config"

INSTALL_DEPS=1
if [ "${1:-}" = "--no-deps" ]; then
  INSTALL_DEPS=0
fi

# Pinned upstream sources: "name|git-url|commit-sha"
# Update a SHA here when you intentionally bump a verified skill source version.
SOURCES=(
  "anthropic-cybersecurity-skills|https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git|768ca51c8d331ab0bdcea8ffb31c9b99bb2c1839"
  "cocoindex|https://github.com/cocoindex-io/cocoindex.git|5e5cc8e6b7caf53b53bb04d247778b1327f5f874"
  "google-skills|https://github.com/google/skills.git|1c3a24610e16b0832be987812de8ac27a5da7b1a"
  "graphiti|https://github.com/getzep/graphiti.git|413b9b2e140e22f4a6d155b30ddc9779a3d47fe2"
  "gsap-skills|https://github.com/greensock/gsap-skills.git|aed9cfd3277740755f6bfc1155c7aa645403b760"
  "mattpocock-skills|https://github.com/mattpocock/skills.git|5d78bd0903420f97c791f834201e550c765699f8"
  "mem0|https://github.com/mem0ai/mem0.git|e4efdd2e29e4a53d2821e9829e004686f3458a9e"
  "ruflo|https://github.com/ruvnet/ruflo.git|8ae87524553569dcd6ba6a7e7e96fbea6b0e0b74"
  "superpowers|https://github.com/obra/superpowers.git|896224c4b1879920ab573417e68fd51d2ccc9072"
)

log() { printf '\033[1;34m[fetch-sources]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[fetch-sources]\033[0m %s\n' "$*" >&2; }

fetch_one() {
  local name="$1" url="$2" sha="$3"
  local dest="$SOURCES_DIR/$name"

  if [ -d "$dest/.git" ]; then
    log "Updating $name -> $sha"
    git -C "$dest" fetch --quiet origin
  else
    log "Cloning $name"
    rm -rf "$dest"
    git clone --quiet "$url" "$dest"
  fi

  # Pin to the exact verified commit. Fetch the specific object first in case
  # it isn't reachable from the default refspec.
  if ! git -C "$dest" cat-file -e "${sha}^{commit}" 2>/dev/null; then
    git -C "$dest" fetch --quiet origin "$sha" || true
  fi
  git -C "$dest" checkout --quiet --detach "$sha"
  log "  $name @ $(git -C "$dest" rev-parse --short HEAD)"
}

main() {
  mkdir -p "$SOURCES_DIR"

  for entry in "${SOURCES[@]}"; do
    IFS='|' read -r name url sha <<< "$entry"
    fetch_one "$name" "$url" "$sha"
  done

  log "All ${#SOURCES[@]} sources are in sync."

  if [ "$INSTALL_DEPS" -eq 1 ] && [ -f "$CONFIG_DIR/package.json" ]; then
    if command -v npm >/dev/null 2>&1; then
      log "Installing tooling/config dependencies"
      if [ -f "$CONFIG_DIR/package-lock.json" ]; then
        ( cd "$CONFIG_DIR" && npm ci --silent )
      else
        ( cd "$CONFIG_DIR" && npm install --silent )
      fi
    else
      warn "npm not found; skipping tooling/config dependency install."
    fi
  fi

  log "Done."
}

main "$@"
