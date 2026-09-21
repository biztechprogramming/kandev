# Agent CLIs in the kandev container

Claude Code and Codex are installed inside the `kandev` container. Kandev finds
them on PATH and uses them for its agent sessions.

## How they are installed

Both are installed with npm inside the container. The image sets npm's global
directory to `/data/.npm-global`, and `docker-compose.yml` mounts `~/.kandev` at
`/data`, so the files live on the host:

```
~/.kandev/.npm-global/bin/claude    @anthropic-ai/claude-code
~/.kandev/.npm-global/bin/codex     @openai/codex
```

The installs are therefore kept across container restarts, `docker compose
down`/`up`, and image rebuilds. They do **not** update themselves.

Logins and history come from the host, mounted into the container:

| Host            | Container               | Holds                            |
| --------------- | ----------------------- | -------------------------------- |
| `~/.claude`     | `/data/home/.claude`    | Claude login, settings, sessions |
| `~/.codex`      | `/data/home/.codex`     | Codex login (`auth.json`), config |

Both directories are shared with the host, so logging in on either side works
for both. Updating a CLI does not touch them.

## Update

From this directory, with the container running:

```bash
./update-agents.sh            # update every agent CLI to its latest version
./update-claude.sh            # Claude Code only
./update-codex.sh             # Codex only
./update-claude.sh 2.1.278    # a specific version (pin or roll back)
./update-codex.sh 0.155.1
```

`update-agents.sh` calls the per-agent scripts and reports which ones failed.
The shared logic lives in `update-agent-common.sh`, which is sourced, not run.

If the container has a different name, set `KANDEV_CONTAINER`:

```bash
KANDEV_CONTAINER=my-kandev ./update-agents.sh
```

### Manual equivalent

```bash
docker exec kandev npm install -g --allow-scripts=@anthropic-ai/claude-code @anthropic-ai/claude-code@latest
docker exec kandev claude --version
```

## Notes

- No container restart is needed. Anything that starts `claude` or `codex`
  after the update gets the new version; processes already running keep the old
  one. A restart is only needed the first time an agent is installed, so Kandev
  detects it.
- npm prints `Unknown env config "store-dir"` during installs. That comes from
  the `npm_config_store_dir` variable the compose file sets for pnpm, and is
  harmless.
- These scripts update the CLIs only. Kandev's chat sessions run through the
  `@agentclientprotocol/*-acp` bridges, which Kandev downloads, pins and updates
  itself.
- Check versions:
  - Installed: `docker exec kandev claude --version`, `docker exec kandev codex --version`
  - Latest published: `docker exec kandev npm view @anthropic-ai/claude-code version`

## Adding another agent CLI

1. Copy `update-codex.sh` to `update-<agent>.sh` and change the package and
   binary names in the `update_npm_agent` call.
2. Add the agent to the loop in `update-agents.sh`.
3. If the agent keeps its login in a host directory, mount that directory in
   `docker-compose.yml` the way `~/.claude` and `~/.codex` are mounted.
4. Restart the container so Kandev detects the new CLI.

## Reinstall from scratch

If `~/.kandev/.npm-global` is deleted, or on a new machine, running
`./update-agents.sh` installs both again.
