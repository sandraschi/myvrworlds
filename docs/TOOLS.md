# vrworlds-mcp tools (v0.1, implemented)

Single portmanteau: `vrworlds(operation, backend?)`.

| Operation | What it does | Status |
|---|---|---|
| `list_backends` | Tier-sorted registry: 11 backends across tiers 0-2 | live |
| `backend_status` | Shallow check per backend or all: repo present, launch hint, `online: false` (nothing daemonized) | live |
| `describe_backend` | Registry entry + `uv run` launch hint for one backend | live |
| `help` | Operation catalog + backend count | live |

No `call_backend_tool` proxy yet. That lands after the stdio transport import
is verified against installed FastMCP. Anything not in this table is not shipped.

## Return shape

`{success, message, ...}` plus `backends` / `status` / `statuses` / `backend`.

## Examples

```json
{"operation": "list_backends"}
{"operation": "backend_status", "backend": "vrchat"}
{"operation": "describe_backend", "backend": "blender"}
```
