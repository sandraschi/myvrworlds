/**
 * API service for MyVRWorlds backend (MCP bridge, health)
 */

const API_BASE = '/api'

export interface MCPServerStatus {
  name: string
  online: boolean
  tools?: number
  error?: string
}

export interface MCPStatusResponse {
  servers: Record<string, MCPServerStatus>
}

export async function fetchMCPStatus(): Promise<MCPStatusResponse> {
  const res = await fetch(`${API_BASE}/mcp/status`)
  if (!res.ok) {
    throw new Error(`MCP status error: ${res.status}`)
  }
  return res.json()
}

export async function callMCPTool(
  server: string,
  tool: string,
  args: Record<string, unknown> = {}
): Promise<{ content: Array<{ type: string; text?: string }> }> {
  const res = await fetch(`${API_BASE}/mcp/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ server, tool, arguments: args })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err?.error ?? `Tool call failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}
