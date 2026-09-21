#!/usr/bin/env bash
# Update the Codex CLI installed in the kandev container.
#
# Usage: ./update-codex.sh [version]    (default: latest)
# Env:   KANDEV_CONTAINER=<name>        (default: kandev)
set -euo pipefail

. "$(dirname "$(readlink -f "$0")")/update-agent-common.sh"

update_npm_agent "@openai/codex" codex "${1:-latest}"
