/**
 * MyVRWorlds API Server
 * Exposes MCP bridge for VR MCP servers (VRChat, Avatar, etc.)
 */
import express from 'express'
import cors from 'cors'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPOS_ROOT = process.env.REPOS_ROOT || path.resolve(__dirname, '..', '..', '..')
const VRCHAT_MCP_PATH = process.env.VRCHAT_MCP_PATH || path.join(REPOS_ROOT, 'vrchat-mcp')
const AVATAR_MCP_PATH = process.env.AVATAR_MCP_PATH || path.join(REPOS_ROOT, 'avatar-mcp')

const app = express()
app.use(cors())
app.use(express.json())

const clients = new Map()

async function getMCPClient(serverName) {
  if (clients.has(serverName)) {
    const c = clients.get(serverName)
    if (c.client) return c.client
    clients.delete(serverName)
  }

  let command, args, cwd
  if (serverName === 'vrchat') {
    command = 'python'
    args = ['-m', 'vrchat_mcp']
    cwd = VRCHAT_MCP_PATH
  } else if (serverName === 'avatar') {
    command = 'python'
    args = ['-m', 'avatar_mcp']
    cwd = AVATAR_MCP_PATH
  } else {
    return null
  }

  try {
    const transport = new StdioClientTransport({
      command,
      args,
      env: { ...process.env },
      cwd
    })
    const client = new Client({ name: 'myvrworlds', version: '1.0.0' })
    await client.connect(transport)
    clients.set(serverName, { client, transport })
    return client
  } catch (err) {
    console.error(`MCP connect error (${serverName}):`, err.message)
    return null
  }
}

async function checkServerStatus(serverName) {
  try {
    const client = await getMCPClient(serverName)
    if (!client) return { online: false, error: 'Not configured or failed to connect' }
    const tools = await client.listTools()
    return { online: true, tools: tools.tools?.length ?? 0 }
  } catch (err) {
    return { online: false, error: err.message }
  }
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/mcp/status', async (_, res) => {
  const [vrchat, avatar] = await Promise.all([
    checkServerStatus('vrchat'),
    checkServerStatus('avatar')
  ])
  res.json({
    servers: {
      vrchat: { name: 'VRChat MCP', ...vrchat },
      avatar: { name: 'Avatar MCP', ...avatar }
    }
  })
})

app.post('/api/mcp/tool', async (req, res) => {
  const { server: serverName, tool: toolName, arguments: toolArgs = {} } = req.body
  if (!serverName || !toolName) {
    return res.status(400).json({ error: 'Missing server or tool name' })
  }
  try {
    const client = await getMCPClient(serverName)
    if (!client) {
      return res.status(503).json({ error: `MCP server ${serverName} not available` })
    }
    const result = await client.callTool({ name: toolName, arguments: toolArgs })
    res.json(result)
  } catch (err) {
    console.error('MCP tool error:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = parseInt(process.env.API_PORT || '11102', 10)
app.listen(PORT, () => {
  console.log(`MyVRWorlds API server listening on port ${PORT}`)
})
