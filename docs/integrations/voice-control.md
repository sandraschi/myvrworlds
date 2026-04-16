# Voice Control Pipeline Integration

## Overview

MyVRWorlds implements the revolutionary **dual STT architecture** from ikubaysan with **multi-provider LLM support**, enabling natural voice interactions with VR AI characters through a two-stage speech processing pipeline that works with both local and cloud AI models.

## Architecture

### Dual STT Pipeline

#### Stage 1: Wake Word Detection (Sphinx)
```
🎤 Audio Input → PocketSphinx → Keyword Detection → State Transition
```

**Characteristics:**
- **Engine**: PocketSphinx (offline CMU Sphinx)
- **Purpose**: Continuous wake word monitoring
- **Performance**: ~1-2% CPU usage
- **Accuracy**: Optimized for specific keywords
- **Activation**: Always listening when character is in "wandering" state

**Configuration:**
```python
keyword_entries = [
    ("ringo", 0.9),        # Primary character name
    ("hey ringo", 0.8),    # Friendly activation
    ("listen ringo", 0.8)  # Attention command
]
```

#### Stage 2: Accurate Transcription (Google Cloud)
```
🎤 Audio Chunk → Google Cloud STT → Full Transcription → AI Processing
```

**Characteristics:**
- **Engine**: Google Cloud Speech-to-Text API
- **Purpose**: High-accuracy conversation transcription
- **Performance**: Cloud-based processing (requires internet)
- **Accuracy**: 95%+ for clear speech
- **Activation**: Only triggered after wake word detection

**Features:**
- Multi-language support
- Noise cancellation
- Context-aware processing
- Real-time streaming support

### State Machine Integration

#### Character States
```typescript
enum CharacterState {
  WANDERING = "wandering",     // Idle, random movements
  CONVERSING = "conversing",   // Active conversation
  PERFORMING = "performing"    // Executing physical actions
}
```

#### State Transitions
```
WANDERING → CONVERSING (wake word detected)
CONVERSING → WANDERING (goodbye/end conversation)
CONVERSING → PERFORMING (action command received)
PERFORMING → CONVERSING (action completed)
```

### Multi-Provider LLM Support

#### Supported Providers
MyVRWorlds integrates with multiple LLM providers for maximum flexibility:

**Local Providers (Privacy-Focused):**
- **Ollama**: Run Llama, Mistral, and other open-source models locally
- **LM Studio**: User-friendly interface for local model management

**Cloud Providers (High Performance):**
- **OpenAI**: GPT-4, GPT-3.5-turbo for advanced conversations
- **Anthropic**: Claude models with strong reasoning capabilities
- **Google Gemini**: Fast and efficient multimodal responses

#### Provider Selection
Choose based on your needs:
- **Local**: Privacy, no API costs, works offline
- **Cloud**: Higher quality, more capable models, requires internet

### AI Response Processing

#### Structured Response Types
The AI generates responses with special prefixes for behavior control:

```typescript
enum ResponseType {
  TYPE_NORMAL = "TYPE_NORMAL",     // Standard response
  TYPE_ENDING = "TYPE_ENDING",     // End conversation
  TYPE_YES = "TYPE_YES",           // Agreement gesture
  TYPE_NO = "TYPE_NO",             // Disagreement gesture
  TYPE_CMD = "TYPE_CMD"            // Physical action command
}
```

#### Response Processing Flow
```
AI Response → Type Detection → Prefix Removal → Action Execution → Voice Synthesis
```

## Implementation

### Frontend Components

#### VoiceControl Page
- Real-time audio level monitoring
- STT pipeline status display
- Session history tracking
- Configuration controls

#### AIChatbot Page
- Character state visualization
- Conversation log with response types
- Voice session management
- ikubaysan architecture explanation

### Backend Integration

#### MCP Server Communication
```typescript
// Voice transcription request
POST /api/voice/transcribe
{
  "audio": "base64-encoded-audio",
  "engine": "sphinx" | "google"
}

// AI response generation
POST /api/ai/chat
{
  "message": "user input",
  "conversation_id": "session-uuid",
  "character_state": "conversing"
}
```

#### OSC Integration
```typescript
// Avatar gesture control
POST /api/osc/avatar/gesture
{
  "gesture": "nod_head" | "shake_head",
  "duration": 500
}

// Movement commands
POST /api/osc/avatar/move
{
  "direction": "forward" | "backward" | "left" | "right",
  "duration": 1000
}
```

## Configuration

### LLM Provider Setup

#### Local LLM Setup

**Ollama:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Start Ollama server (runs on localhost:11434)
ollama serve
```

**LM Studio:**
1. Download from https://lmstudio.ai/
2. Load a model (GGUF format)
3. Start local server (default: localhost:1234)

#### Cloud LLM Setup

**OpenAI:**
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Anthropic:**
```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Google Gemini:**
```env
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### Environment Variables
```env
# Google Cloud STT
VITE_GOOGLE_CLOUD_API_KEY=your_api_key
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id

# Wake word configuration
VITE_WAKE_WORDS=ringo,hey ringo,listen ringo
VITE_WAKE_WORD_SENSITIVITY=0.8

# Audio settings
VITE_AUDIO_SAMPLE_RATE=16000
VITE_AUDIO_CHUNK_SIZE=1024
```

### Character Configuration
```json
{
  "character": {
    "name": "ringo",
    "wake_words": ["ringo", "hey ringo"],
    "voice_settings": {
      "rate": 180,
      "volume": 0.8,
      "voice_id": "english-us"
    },
    "behavior": {
      "conversation_timeout": 60,
      "wandering_interval": 10,
      "max_consecutive_confused": 3
    }
  }
}
```

## Usage

### Basic Voice Interaction

1. **Character Wandering**: Random movements, listening for wake words
2. **Wake Word Detection**: "Hey ringo" triggers conversation mode
3. **Voice Transcription**: Full sentence processing via Google Cloud
4. **AI Processing**: Context-aware response generation
5. **Response Classification**: Type-based behavior (gestures, actions)
6. **Voice Synthesis**: Text-to-speech output
7. **State Management**: Automatic conversation flow control

### Advanced Features

#### Action Commands
```
User: "Ringo, turn left"
AI: "TYPE_CMD_TURN_LEFT I'll turn left for you."
→ Character performs turning animation
```

#### Conversation End
```
User: "Goodbye ringo"
AI: "TYPE_ENDING Goodbye! It was nice talking to you."
→ Character waves and returns to wandering
```

#### Gesture Responses
```
User: "Do you like VRChat?"
AI: "TYPE_YES I absolutely love VRChat!"
→ Character nods head twice
```

## Performance Optimization

### Resource Management
- **Sphinx**: Always-on, low-power wake word detection
- **Google Cloud**: On-demand, high-accuracy transcription
- **Audio Buffering**: Efficient memory usage with circular buffers
- **Connection Pooling**: Reused HTTP connections for cloud APIs

### Latency Optimization
- **Wake Word**: <100ms detection latency
- **Transcription**: <500ms for short phrases
- **AI Response**: <2s for typical interactions
- **Voice Synthesis**: Real-time streaming output

## Troubleshooting

### Wake Word Not Detected
- Check microphone sensitivity
- Verify wake word pronunciation
- Adjust keyword sensitivity threshold
- Test with different microphone

### Google Cloud Errors
- Verify API credentials
- Check internet connectivity
- Monitor API quota usage
- Review audio format compatibility

### Audio Quality Issues
- Ensure 16kHz sample rate
- Check for background noise
- Verify microphone placement
- Test with different audio devices

### Performance Problems
- Monitor CPU usage during Sphinx processing
- Check network latency to Google Cloud
- Optimize audio chunk sizes
- Implement audio compression if needed

## Future Enhancements

### Planned Features
- **Whisper Integration**: Local Whisper model for offline transcription
- **Multi-character Support**: Multiple AI characters with different personalities
- **Emotion Recognition**: Voice emotion detection for contextual responses
- **Language Detection**: Automatic language switching
- **Custom Voice Models**: Character-specific voice synthesis

### Research Areas
- **Neural Wake Word Detection**: More accurate and efficient wake word spotting
- **Contextual Speech Recognition**: Conversation-aware transcription
- **Real-time Voice Cloning**: Dynamic voice adaptation
- **Multi-modal Integration**: Combining voice with gesture recognition

## API Reference

### Voice Processing Endpoints

#### POST /api/voice/detect-wake-word
Detect wake words in audio stream using Sphinx.

**Request:**
```json
{
  "audio_stream": "webm-base64",
  "keywords": ["ringo", "hey ringo"],
  "sensitivity": 0.8
}
```

**Response:**
```json
{
  "detected": true,
  "keyword": "ringo",
  "confidence": 0.95,
  "timestamp": 1234567890
}
```

#### POST /api/voice/transcribe
Transcribe audio using Google Cloud STT.

**Request:**
```json
{
  "audio": "wav-base64",
  "language": "en-US",
  "model": "latest_long",
  "enable_automatic_punctuation": true
}
```

**Response:**
```json
{
  "transcript": "Hello ringo, how are you doing today?",
  "confidence": 0.98,
  "words": [
    {"word": "Hello", "start_time": 0.0, "end_time": 0.5},
    {"word": "ringo", "start_time": 0.5, "end_time": 0.8}
  ]
}
```

#### POST /api/ai/generate-response
Generate AI response with ikubaysan response types.

**Request:**
```json
{
  "message": "Hello ringo",
  "conversation_id": "conv-123",
  "character_context": {
    "name": "ringo",
    "personality": "friendly AI assistant",
    "current_state": "conversing"
  }
}
```

**Response:**
```json
{
  "response": "TYPE_NORMAL Hello! I'm doing great, thank you for asking!",
  "response_type": "TYPE_NORMAL",
  "confidence": 0.92,
  "tokens_used": 45
}
```
