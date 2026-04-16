# VR MCP Server Integrations

This directory contains detailed documentation for integrating with each VR-related MCP server in MyVRWorlds.

## Available Integrations

### Core VR Platforms
- **[Avatar MCP](./avatar-mcp.md)**: VR avatar creation and animation control
- **[Blender MCP](./blender-mcp.md)**: 3D modeling and rendering integration
- **[VRChat MCP](./vrchat-mcp.md)**: VRChat world and avatar control via OSC
- **[Resonite MCP](./resonite-mcp.md)**: Resonite session and Logix management

### Communication Protocols
- **[OSC MCP](./osc-mcp.md)**: Open Sound Control protocol handling
- **[Unity MCP](./unity-mcp.md)**: Unity game engine integration

### AI & Voice
- **[Advanced Memory MCP](./advanced-memory-mcp.md)**: AI context and conversation memory
- **[Voice Control Pipeline](./voice-control.md)**: Dual STT architecture with multi-provider LLM support

## Integration Architecture

### Connection Flow
```
MyVRWorlds Frontend ↔ MCP Server ↔ VR Application
       ↓                    ↓              ↓
   WebSocket/HTTP    FastMCP Protocol    OSC/Direct API
```

### State Synchronization
- Real-time state updates between frontend and VR applications
- Bidirectional communication for voice, animation, and control
- Error handling and reconnection logic

## Setup Requirements

### Prerequisites
1. **Python 3.9+** for MCP servers
2. **Node.js 18+** for frontend development
3. **VR Applications** installed and configured
4. **API Keys** for cloud services (Google Cloud, OpenAI)

### Network Configuration
- **OSC Ports**: 9000-9005 (configurable)
- **MCP Servers**: localhost:8000-8005
- **WebSocket**: ws://localhost:3001

## Quick Integration Guide

### 1. Start MCP Servers
```bash
# Terminal 1: Avatar MCP
cd ../avatar-mcp && python -m src.avatar_mcp.server

# Terminal 2: VRChat MCP
cd ../vrchat-mcp && python -m src.vrchat_mcp.server

# Terminal 3: OSC MCP
cd ../osc-mcp && python -m src.osc_mcp.server
```

### 2. Configure Frontend
```typescript
// src/config/mcp-servers.ts
export const MCP_SERVERS = {
  avatar: { url: 'http://localhost:8000', enabled: true },
  vrchat: { url: 'http://localhost:8001', enabled: true },
  osc: { url: 'http://localhost:8002', enabled: true },
  // ... other servers
}
```

### 3. Start Frontend
```bash
npm install
npm run dev
```

### 4. Test Integration
- Open http://localhost:3001
- Navigate to each VR control panel
- Test voice commands and avatar control
- Monitor MCP server logs for errors

## Troubleshooting Common Issues

### Connection Refused
- Check if MCP servers are running
- Verify port configurations
- Check firewall settings

### Voice Not Working
- Ensure microphone permissions in browser
- Verify Google Cloud credentials
- Check audio device configuration

### OSC Not Responding
- Confirm VR application OSC settings
- Check IP address and port configuration
- Verify network connectivity

### Performance Issues
- Monitor browser console for errors
- Check network latency to MCP servers
- Reduce real-time update frequency if needed

## Development Guidelines

### Adding New Integrations
1. Create integration documentation in this folder
2. Add MCP server configuration to frontend config
3. Implement React components for the integration
4. Add routing and navigation
5. Test with actual VR applications

### Code Standards
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Add loading states and user feedback
- Document all API interactions

### Testing
- Unit tests for React components
- Integration tests for MCP server communication
- End-to-end tests with VR applications
- Performance testing for real-time features

## Support

For integration issues:
1. Check individual MCP server documentation
2. Review browser console and server logs
3. Test with minimal configuration
4. Create issue in respective repository

## Contributing

When adding new VR MCP integrations:
1. Follow the established documentation format
2. Include setup instructions and troubleshooting
3. Provide example configurations
4. Test integration thoroughly before submitting
