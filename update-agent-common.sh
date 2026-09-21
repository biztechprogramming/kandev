#!/usr/bin/env bash
# Shared helper for update-claude.sh and update-codex.sh.
# Not meant to be run directly.
set -euo pipefail

# update_npm_agent <npm-package> <binary> <version>
update_npm_agent() {
  local pkg="$1" bin="$2" version="$3"
  local container="${KANDEV_CONTAINER:-kandev}"

  if [ "$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null)" != "true" ]; then
    echo "Container '$container' is not running. Start it with: docker compose up -d" >&2
    return 1
  fi

  local current
  current="$(docker exec "$container" sh -c "$bin --version 2>/dev/null" || echo 'not installed')"
  echo "$bin current: $current"

  echo "Installing $pkg@$version ..."
  docker exec "$container" npm install -g --allow-scripts="$pkg" "$pkg@$version"

  echo "$bin updated: $(docker exec "$container" "$bin" --version)"
}
