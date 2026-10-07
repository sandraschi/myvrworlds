"""vrworlds-mcp aggregator server.

[RATIONALE] One portmanteau groups all aggregator ops so agent context stays
small while the backend count grows (11 entries). No always-on daemons:
backends are stdio MCP servers plus heavy wrappees (Blender, Unity, VRChat
client) that may not be installed, so every op is a shallow registry or
filesystem check. Full tool passthrough lands next batch after the transport
import is verified against installed FastMCP.
"""

from __future__ import annotations

from pathlib import Path
from typing import Annotated, Literal

import yaml
from fastmcp import FastMCP
from pydantic import Field

mcp = FastMCP("vrworlds-mcp")

REPOS_ROOT = Path(__file__).resolve().parents[3]
REGISTRY_PATH = Path(__file__).resolve().parents[2].parent.parent / "config" / "backends.yaml"


def _registry_path() -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent.parent / "config" / "backends.yaml",
        Path.cwd() / "config" / "backends.yaml",
        REGISTRY_PATH,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def _load_registry() -> dict:
    path = _registry_path()
    if not path.exists():
        return {"backends": {}, "version": 0}
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {"backends": {}}


def _backend_status(name: str, entry: dict) -> dict:
    repo = str(entry.get("repo", name))
    module = str(entry.get("module", name))
    # Registry repos live directly under D:/Dev/repos.
    repos_dir = Path("D:/Dev/repos")
    candidate = repos_dir / repo
    repo_exists = candidate.exists()
    module_hint = (
        f"uv run --project {candidate} python -m {module}" if repo_exists else f"repo {repo} not checked out"
    )
    return {
        "name": name,
        "repo": repo,
        "tier": entry.get("tier"),
        "role": entry.get("role", ""),
        "repo_present": repo_exists,
        "repo_path": str(candidate),
        "launch_hint": module_hint,
        "online": False,
        "note": entry.get("note", "on-demand stdio; not daemonized. Full proxy lands next batch."),
    }


@mcp.tool()
async def vrworlds(
    operation: Annotated[
        Literal["list_backends", "backend_status", "describe_backend", "help"],
        Field(description="Aggregator operation to perform"),
    ],
    backend: Annotated[str | None, Field(description="Backend key from list_backends")] = None,
) -> dict:
    """VR worlds aggregator router.

    ## Return Format
    `{success: bool, message: str, ...operation-specific fields}`.
    `list_backends` returns `backends: [{name, tier, role}]`.
    `backend_status` returns `status` for one backend or `statuses` for all.
    `describe_backend` returns registry entry plus launch hint.

    ## Examples
    `{"operation": "list_backends"}`
    `{"operation": "backend_status", "backend": "vrchat"}`
    `{"operation": "describe_backend", "backend": "blender"}`
    """
    registry = _load_registry()
    backends: dict = registry.get("backends", {})

    if operation == "list_backends":
        items = [
            {"name": name, "tier": entry.get("tier"), "role": entry.get("role", "")}
            for name, entry in sorted(backends.items(), key=lambda kv: (kv[1].get("tier", 9), kv[0]))
        ]
        return {"success": True, "message": f"{len(items)} backends registered", "backends": items}

    if operation == "backend_status":
        if backend:
            entry = backends.get(backend)
            if entry is None:
                return {
                    "success": False,
                    "message": f"unknown backend '{backend}'",
                    "known": sorted(backends),
                }
            return {
                "success": True,
                "message": f"status for {backend}",
                "status": _backend_status(backend, entry),
            }
        statuses = {name: _backend_status(name, entry) for name, entry in backends.items()}
        present = sum(1 for status in statuses.values() if status["repo_present"])
        return {
            "success": True,
            "message": f"{present}/{len(statuses)} backend repos present (on-demand, none daemonized)",
            "statuses": statuses,
        }

    if operation == "describe_backend":
        if not backend:
            return {"success": False, "message": "backend is required", "known": sorted(backends)}
        entry = backends.get(backend)
        if entry is None:
            return {"success": False, "message": f"unknown backend '{backend}'", "known": sorted(backends)}
        return {
            "success": True,
            "message": f"registry entry for {backend}",
            "backend": _backend_status(backend, entry),
        }

    return {
        "success": True,
        "message": "vrworlds-mcp aggregator: on-demand router, no daemons",
        "operations": ["list_backends", "backend_status", "describe_backend", "help"],
        "backends_known": len(backends),
    }
