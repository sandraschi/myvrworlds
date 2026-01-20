# MyVRWorlds Documentation

Beautiful React Tailwind VR Worlds Control Center integrating all VR-related MCP servers with ikubaysan dual-STT AI chatbot architecture.

## Overview

MyVRWorlds provides a unified web interface for controlling and monitoring VR worlds with advanced AI voice control:

### VR Platform Integrations
- **Avatar MCP**: VR avatar creation and animation control
- **Blender MCP**: 3D modeling and rendering integration
- **VRChat MCP**: VRChat world and avatar control via OSC
- **Resonite MCP**: Resonite session and Logix management
- **OSC MCP**: Open Sound Control protocol handling
- **Unity MCP**: Unity game engine integration
- **Advanced Memory MCP**: AI context and conversation memory

### AI Voice Control (ikubaysan Architecture)
- **Dual STT Pipeline**: Sphinx wake-word detection + Google Cloud accurate transcription
- **Multi-Provider LLM Support**: Local (Ollama, LM Studio) + Cloud (OpenAI, Anthropic, Gemini)
- **Character State Machine**: Wandering → Conversing → Performing Actions
- **Structured AI Responses**: TYPE_NORMAL, TYPE_ENDING, TYPE_YES, TYPE_NO, TYPE_CMD
- **Privacy Options**: Run entirely local with Ollama for complete privacy

## Architecture

### Dual STT Voice Pipeline (ikubaysan Architecture)

The system implements a revolutionary two-stage speech-to-text pipeline:

#### Stage 1: Wake Word Detection (Sphinx)
- **Engine**: PocketSphinx (offline, fast)
- **Purpose**: Always-listening keyword spotting
- **CPU Usage**: ~1-2% continuous monitoring
- **Trigger**: Character name detection ("ringo", "hey ringo")
- **Action**: Transitions character to "conversing" state

#### Stage 2: Accurate Transcription (Google Cloud)
- **Engine**: Google Cloud Speech-to-Text API
- **Purpose**: High-accuracy full sentence processing
- **Activation**: Only triggered after wake word detection
- **Features**: Multi-language, noise cancellation, context awareness

### Character State Machine

Three behavioral states with distinct behaviors:

1. **WanderingState**: Random movements, idle behaviors
2. **ConversingState**: Active voice interaction, response generation
3. **PerformingActionState**: Executing physical commands (movement, gestures)

### Action Queuing System

Asynchronous command execution for VR avatar control:
- Movement commands (forward, back, turn)
- Gesture animations (nod, shake head)
- State transitions with proper cleanup

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Interface**:
   - Open http://localhost:3001
   - Navigate through VR MCP integrations
   - Test voice control features

## MCP Server Integration

### Avatar MCP
- Real-time avatar customization
- Blendshape animation control
- IK rigging management

### Blender MCP
- 3D model import/export
- Render queue management
- Asset pipeline integration

### VRChat MCP
- OSC avatar parameter control
- World instance management
- Udon script integration

### Resonite MCP
- Session management
- Logix visual scripting
- Asset synchronization

## Voice Control Features

### Dual STT Pipeline
- **Sphinx**: Continuous wake word detection
- **Google Cloud**: Accurate conversation transcription
- **Response Types**: Structured AI responses (TYPE_NORMAL, TYPE_ENDING, etc.)

### Character Behaviors
- Wake word activation
- Context-aware conversations
- Physical action execution
- State-based behavior transitions

## Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Query, Context API
- **UI Components**: Radix UI primitives
- **3D Integration**: React Three Fiber
- **Real-time**: Socket.io, WebRTC
- **Voice**: Web Audio API, MediaRecorder

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI primitives
│   └── Layout.tsx      # Main app layout
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
└── types/              # TypeScript definitions
```

## API Integration

### MCP Server Endpoints

#### Avatar Control
```typescript
POST /api/avatar/animate
POST /api/avatar/blendshapes
GET /api/avatar/state
```

#### Voice Processing
```typescript
POST /api/voice/transcribe
POST /api/voice/synthesize
GET /api/voice/status
```

#### VRChat Integration
```typescript
POST /api/vrchat/osc
GET /api/vrchat/avatars
POST /api/vrchat/world
```

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLOUD_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
VITE_VRCHAT_OSC_PORT=9000
```

### MCP Server Configuration
Each MCP server requires specific configuration in their respective config files. See individual integration docs for details.

## Troubleshooting

### Voice Control Issues
- Ensure microphone permissions
- Check Google Cloud credentials
- Verify Sphinx model files

### VR Application Connection
- Confirm OSC ports are open
- Check firewall settings
- Verify VR application is running

### MCP Server Errors
- Check server logs
- Verify API endpoints
- Confirm network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.