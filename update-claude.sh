#!/usr/bin/env bash
# Update the Claude Code CLI installed in the kandev container.
#
# Usage: ./update-claude.sh [version]   (default: latest)
# Env:   KANDEV_CONTAINER=<name>        (default: kandev)
set -euo pipefail

. "$(dirname "$(readlink -f "$0")")/update-agent-common.sh"

update_npm_agent "@anthropic-ai/claude-code" claude "${1:-latest}"
