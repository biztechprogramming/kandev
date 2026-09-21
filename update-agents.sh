#!/usr/bin/env bash
# Update every agent CLI installed in the kandev container, by calling the
# per-agent scripts. Each is updated to its latest version; for a specific
# version, call ./update-claude.sh or ./update-codex.sh directly.
#
# Usage: ./update-agents.sh
# Env:   KANDEV_CONTAINER=<name>        (default: kandev)
set -uo pipefail

dir="$(dirname "$(readlink -f "$0")")"
failed=()

for agent in claude codex; do
  echo "=== $agent"
  "$dir/update-$agent.sh" || failed+=("$agent")
  echo
done

if [ ${#failed[@]} -gt 0 ]; then
  echo "Failed: ${failed[*]}" >&2
  exit 1
fi

echo "All agents updated."
