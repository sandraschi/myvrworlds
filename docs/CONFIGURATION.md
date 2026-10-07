# vrworlds-mcp configuration (v0.1)

## Backend registry

`config/backends.yaml` is the single source of truth. 11 entries:

- Tier 0 (world runtimes): `vrchat`, `resonite`, `overte`
- Tier 1 (creation): `avatar`, `vroidstudio`, `blender`, `unity3d`, `godot`, `worldlabs`
- Tier 2 (glue): `osc`, `speech`

Each entry: `repo`, `module`, `tier`, `role`, optional `note`.
Defaults: `transport: stdio`, `launch_runner: uv run python -m`,
`idle_ttl_seconds: 300`, `health_cache_seconds: 30`.

## Voice

`speech-mcp` owns wake word + STT per `VOICE_COMMAND_BUS.md`.
`vrworlds-mcp` is a member: it exposes domain tools only and never runs its
own wake listener.

## Ports (pending registration)

Dry-run claim: frontend `11239`, backend `11240`, MCP `11241`.
Run `claim_ports.py --repo vrworlds-mcp --apply` when promoting out of
`myvrworlds/` into `vrworlds-mcp/`. The legacy `config/ports.json`
(`11xxx` scheme) is superseded and will be removed at rename time.

## Adding a backend

Append to `config/backends.yaml`, run `backend_status` to verify the repo
path resolves, document the role in `docs/TOOLS.md`. No code change needed.
