import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Settings,
  Activity,
  Zap,
  Brain
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { llmService, LLMService } from '@/services/llmService'
import LLMConfig from '@/components/LLMConfig'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  responseType?: string
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [characterState, setCharacterState] = useState<'wandering' | 'conversing' | 'performing'>('wandering')
  const [wakeWordDetected, setWakeWordDetected] = useState(false)
  const [currentLLMConfig, setCurrentLLMConfig] = useState<any>(null)
  const [showLLMConfig, setShowLLMConfig] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load saved LLM configuration
    const savedConfig = localStorage.getItem('myvrworlds-llm-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setCurrentLLMConfig(config)
        llmService.configure(config)
      } catch (error) {
        console.error('Error loading LLM config:', error)
      }
    }
  }, [])

  const simulateDualSTT = async () => {
    if (!isListening) return

    // Simulate wake word detection with Sphinx (fast)
    setTimeout(() => {
      setWakeWordDetected(true)
      toast({
        title: "Wake Word Detected",
        description: "Sphinx detected 'ringo' - switching to Google Cloud for accurate transcription",
      })
    }, 1000)

    // Simulate full transcription with Google Cloud (accurate)
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: "Hello ringo, can you tell me about VRChat?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setCharacterState('conversing')
      setWakeWordDetected(false)

      // Generate AI response using configured LLM
      setTimeout(async () => {
        try {
          const llmResponse = await llmService.generateStructuredResponse(
            userMessage.content,
            "ringo"
          )

          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: llmResponse.content,
            timestamp: new Date(),
            responseType: llmResponse.responseType
          }
          setMessages(prev => [...prev, aiResponse])
          setIsSpeaking(true)

          // Simulate speech completion
          setTimeout(() => {
            setIsSpeaking(false)
          }, 3000)
        } catch (error) {
          console.error('Error generating AI response:', error)
          toast({
            title: "AI Response Error",
            description: "Failed to generate AI response. Check LLM configuration.",
            variant: "destructive"
          })
        }
      }, 1500)
    }, 2000)
  }

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true)
      toast({
        title: "Voice Control Activated",
        description: "Sphinx wake-word detection active. Say 'ringo' to start conversation.",
      })
      simulateDualSTT()
    } else {
      setIsListening(false)
      setWakeWordDetected(false)
      setCharacterState('wandering')
      toast({
        title: "Voice Control Deactivated",
        description: "Character returned to wandering state",
      })
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'wandering': return 'bg-blue-500'
      case 'conversing': return 'bg-green-500'
      case 'performing': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getStateDescription = (state: string) => {
    switch (state) {
      case 'wandering': return 'Random movements, listening for wake word'
      case 'conversing': return 'Active conversation, processing voice input'
      case 'performing': return 'Executing physical actions (movement, gestures)'
      default: return 'Unknown state'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Chatbot Control
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          ikubaysan-inspired dual STT architecture with character state machine.
          Features Sphinx wake-word detection + Google Cloud accurate transcription.
        </p>
      </div>

      {/* LLM Provider Info */}
      {currentLLMConfig && (
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span>AI Provider: {LLMService.PROVIDERS[currentLLMConfig.provider]?.name || currentLLMConfig.provider}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline" className="bg-purple-600/20 text-purple-400">
                {LLMService.PROVIDERS[currentLLMConfig.provider]?.type === 'local' ? '🏠 Local' : '☁️ Cloud'}
              </Badge>
              <span>Model: {currentLLMConfig.model}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLLMConfig(!showLLMConfig)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
            {showLLMConfig && (
              <div className="mt-4">
                <LLMConfig
                  compact
                  initialConfig={currentLLMConfig}
                  onConfigChange={(config) => {
                    setCurrentLLMConfig(config)
                    llmService.configure(config)
                    setShowLLMConfig(false)
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Character State</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStateColor(characterState)} animate-pulse`} />
              <div>
                <p className="font-semibold capitalize">{characterState}</p>
                <p className="text-sm text-gray-400">{getStateDescription(characterState)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Voice Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sphinx Wake-Word</span>
                <Badge variant={isListening ? "default" : "secondary"} className="bg-green-600/20">
                  {isListening ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Google Cloud STT</span>
                <Badge variant={wakeWordDetected ? "default" : "secondary"} className="bg-blue-600/20">
                  {wakeWordDetected ? "Processing" : "Standby"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>Audio Output</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm">{isSpeaking ? 'Speaking' : 'Silent'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Voice Control Panel</CardTitle>
          <CardDescription>
            Dual STT Architecture: Fast wake-word detection (Sphinx) → Accurate transcription (Google Cloud)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant={isListening ? "destructive" : "vr"}
              onClick={handleVoiceToggle}
              className="flex items-center space-x-2"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span>{isListening ? 'Stop Listening' : 'Start Voice Control'}</span>
            </Button>

            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configure STT</span>
            </Button>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Zap className="h-4 w-4" />
              <span>Response Types: TYPE_NORMAL, TYPE_ENDING, TYPE_YES, TYPE_NO, TYPE_CMD</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversation Log</span>
          </CardTitle>
          <CardDescription>
            Real-time chat with structured AI responses and state machine feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-black/10 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Say "ringo" to start a conversation</p>
                <p className="text-sm mt-2">Character is currently wandering...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'ai-response-bubble'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.responseType && (
                        <Badge variant="outline" className="text-xs">
                          {message.responseType}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Architecture Info */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>ikubaysan Dual STT Architecture</CardTitle>
          <CardDescription>
            Revolutionary voice processing pipeline for VR AI characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Phase 1: Wake Word Detection</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• PocketSphinx: Fast, offline wake word detection</li>
                <li>• Low CPU usage, always listening</li>
                <li>• Keyword spotting for character names</li>
                <li>• Triggers transition to conversation state</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Phase 2: Accurate Transcription</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Google Cloud Speech: High accuracy STT</li>
                <li>• Activated only after wake word detection</li>
                <li>• Full sentence processing with context</li>
                <li>• Supports multiple languages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AIChatbot