import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
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

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
    ? (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition)
    : null

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [characterState, setCharacterState] = useState<'wandering' | 'conversing' | 'performing'>('wandering')
  const [currentLLMConfig, setCurrentLLMConfig] = useState<Record<string, unknown> | null>(null)
  const [showLLMConfig, setShowLLMConfig] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<InstanceType<NonNullable<typeof SpeechRecognitionAPI>> | null>(null)

  const isSupported = !!SpeechRecognitionAPI

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const savedConfig = localStorage.getItem('myvrworlds-llm-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig) as Record<string, unknown>
        setCurrentLLMConfig(config)
        llmService.configure(config as Parameters<typeof llmService.configure>[0])
      } catch (error) {
        console.error('Error loading LLM config:', error)
      }
    }
  }, [])

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast({ title: 'Not Supported', description: 'Web Speech API not available. Use Chrome or Edge.', variant: 'destructive' })
      return
    }
    if (!llmService.getConfig()) {
      toast({ title: 'LLM Not Configured', description: 'Configure an LLM in Settings first.', variant: 'destructive' })
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setIsListening(false)
      setCharacterState('wandering')
      toast({ title: 'Voice Control Deactivated', description: 'Stopped listening.' })
      return
    }

    const Recognition = SpeechRecognitionAPI!
    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) finalTranscript += res[0].transcript
      }
      if (!finalTranscript.trim()) return

      recognition.stop()
      recognitionRef.current = null
      setIsListening(false)
      setCharacterState('conversing')

      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: finalTranscript.trim(),
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, userMessage])

      setIsGenerating(true)
      try {
        const llmResponse = await llmService.generateStructuredResponse(userMessage.content, 'ringo')
        const responseType = llmResponse.content.split(' ')[0]
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: llmResponse.content,
          timestamp: new Date(),
          responseType
        }
        setMessages((prev) => [...prev, aiResponse])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'LLM error'
        toast({ title: 'AI Response Error', description: msg, variant: 'destructive' })
      } finally {
        setIsGenerating(false)
      }
    }

    recognition.onerror = (event: Event & { error?: string }) => {
      const err = (event as { error?: string }).error
      if (err === 'no-speech') return
      toast({ title: 'Recognition Error', description: err ?? 'Unknown error', variant: 'destructive' })
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
    toast({ title: 'Voice Control Active', description: 'Speak and AI will respond when you stop.' })
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
      case 'wandering': return 'Waiting for voice input'
      case 'conversing': return 'Processing conversation'
      case 'performing': return 'Executing actions'
      default: return 'Unknown state'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Chatbot Control
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Voice-controlled AI chatbot using Web Speech API and ikubaysan response format.
        </p>
      </div>

      {currentLLMConfig && (
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span>AI Provider: {LLMService.PROVIDERS[String(currentLLMConfig.provider)]?.name ?? String(currentLLMConfig.provider)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline" className="bg-purple-600/20 text-purple-400">
                {LLMService.PROVIDERS[String(currentLLMConfig.provider)]?.type === 'local' ? 'Local' : 'Cloud'}
              </Badge>
              <span>Model: {String(currentLLMConfig.model)}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowLLMConfig(!showLLMConfig)}>
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
            {showLLMConfig && (
              <div className="mt-4">
                <LLMConfig
                  compact
                  initialConfig={currentLLMConfig as import('@/services/llmService').LLMConfig}
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

      {!currentLLMConfig && (
        <Card className="bg-black/20 backdrop-blur-md border-white/10 border-amber-500/50">
          <CardContent className="pt-6">
            <p className="text-amber-400 mb-4">Configure an LLM in Settings to use the AI chatbot.</p>
            <Button variant="vr" asChild>
              <Link to="/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
            <Badge variant={isListening ? 'default' : 'secondary'} className="bg-green-600/20">
              {isListening ? 'Listening' : isGenerating ? 'Generating' : 'Idle'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">{isGenerating ? 'AI responding...' : 'Ready'}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Voice Control Panel</CardTitle>
          <CardDescription>
            Use Web Speech API for voice input. Speak, then stop for AI to respond.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 flex-wrap">
            <Button
              variant={isListening ? 'destructive' : 'vr'}
              onClick={handleVoiceToggle}
              disabled={!currentLLMConfig || !isSupported || isGenerating}
              className="flex items-center space-x-2"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span>{isListening ? 'Stop Listening' : 'Start Voice Control'}</span>
            </Button>
            <Link to="/settings">
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configure LLM</span>
              </Button>
            </Link>
            <span className="text-sm text-gray-400">
              <Zap className="h-4 w-4 inline mr-1" />
              Response Types: TYPE_NORMAL, TYPE_ENDING, TYPE_YES, TYPE_NO, TYPE_CMD
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversation Log</span>
          </CardTitle>
          <CardDescription>
            Voice-driven chat with ikubaysan structured responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-black/10 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click Start Voice Control and speak to begin</p>
                <p className="text-sm mt-2">Configure an LLM in Settings first</p>
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
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      <span className="text-xs opacity-75">{message.timestamp.toLocaleTimeString()}</span>
                      {message.responseType && (
                        <Badge variant="outline" className="text-xs">{message.responseType}</Badge>
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
    </div>
  )
}

export default AIChatbot
