import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, Brain, Activity, Play, Square } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { llmService } from '@/services/llmService'

interface VoiceSession {
  id: string
  startTime: Date
  transcriptions: string[]
  responses: string[]
  duration: number
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
    ? (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition)
    : null

const VoiceControl: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [sessions, setSessions] = useState<VoiceSession[]>([])
  const recognitionRef = useRef<InstanceType<NonNullable<typeof SpeechRecognitionAPI>> | null>(null)
  const startTimeRef = useRef<number>(0)
  const { toast } = useToast()

  const isSupported = !!SpeechRecognitionAPI

  const startVoiceSession = () => {
    if (!isSupported) {
      toast({ title: 'Not Supported', description: 'Web Speech API is not available in this browser. Use Chrome or Edge.', variant: 'destructive' })
      return
    }
    if (!llmService.getConfig()) {
      toast({ title: 'LLM Not Configured', description: 'Configure an LLM in Settings before using voice control.', variant: 'destructive' })
      return
    }

    setIsRecording(true)
    setIsListening(true)
    setIsProcessing(false)
    setTranscript('')
    setAudioLevel(0)
    startTimeRef.current = Date.now()

    const Recognition = SpeechRecognitionAPI!
    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        const text = res[0].transcript
        if (res.isFinal) final += text
        else interim += text
      }
      if (final) setTranscript((prev) => (prev + ' ' + final).trim())
      if (interim) setTranscript((prev) => (prev + ' ' + interim).trim())
    }

    recognition.onerror = (event: Event & { error?: string }) => {
      const err = (event as { error?: string }).error
      if (err === 'no-speech') return
      toast({ title: 'Recognition Error', description: err ?? 'Unknown error', variant: 'destructive' })
    }

    recognition.start()
    recognitionRef.current = recognition

    toast({ title: 'Voice Session Started', description: 'Listening for speech. Speak and click Stop when done.' })
  }

  const stopVoiceSession = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)

    if (!transcript.trim()) {
      setIsRecording(false)
      toast({ title: 'Voice Session Stopped', description: 'No speech detected.' })
      return
    }

    setIsProcessing(true)
    const sessionStart = startTimeRef.current
    const duration = Date.now() - sessionStart

    try {
      const llmResponse = await llmService.generateStructuredResponse(transcript.trim(), 'ringo')
      const newSession: VoiceSession = {
        id: Date.now().toString(),
        startTime: new Date(sessionStart),
        transcriptions: [transcript.trim()],
        responses: [llmResponse.content],
        duration
      }
      setSessions((prev) => [newSession, ...prev.slice(0, 9)])
      toast({ title: 'Voice Session Complete', description: 'Transcription processed and AI response generated.' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'LLM error'
      toast({ title: 'AI Response Error', description: msg, variant: 'destructive' })
      const newSession: VoiceSession = {
        id: Date.now().toString(),
        startTime: new Date(sessionStart),
        transcriptions: [transcript.trim()],
        responses: [`[Error: ${msg}]`],
        duration
      }
      setSessions((prev) => [newSession, ...prev.slice(0, 9)])
    } finally {
      setIsProcessing(false)
      setIsRecording(false)
      setTranscript('')
      setAudioLevel(0)
    }
  }

  useEffect(() => {
    if (!isListening) return
    let rafId: number
    const tick = () => {
      setAudioLevel((prev) => Math.min(100, prev + (Math.random() * 20 - 8)))
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isListening])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Voice Control System
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Web Speech API for real-time speech-to-text. Configure an LLM in Settings for AI responses.
        </p>
      </div>

      {!isSupported && (
        <Card className="bg-black/20 backdrop-blur-md border-white/10 border-amber-500/50">
          <CardContent className="pt-6">
            <p className="text-amber-400">
              Web Speech API is not supported. Use Chrome, Edge, or Safari for speech recognition.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-6 w-6" />
            <span>Voice Processing Control</span>
          </CardTitle>
          <CardDescription>
            Start a voice session to record speech and get AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant={isRecording ? 'destructive' : 'vr'}
              onClick={isRecording ? stopVoiceSession : startVoiceSession}
              disabled={!isSupported || isProcessing}
              className="flex items-center space-x-2"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span>{isProcessing ? 'Processing...' : isRecording ? 'Stop & Process' : 'Start Voice Session'}</span>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="outline" className={isListening ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20'}>
                {isListening ? 'Listening' : isProcessing ? 'Processing' : 'Idle'}
              </Badge>
            </div>
            <Progress value={isListening ? Math.min(100, audioLevel + 30) : 0} className="h-2" />
          </div>

          {transcript && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <span className="text-sm text-gray-400">Live transcript:</span>
              <p className="text-sm mt-1">{transcript}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span>Web Speech API</span>
            </CardTitle>
            <CardDescription>Browser-native speech recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Supported in Chrome, Edge, Safari</p>
              <p>No cloud API key required</p>
              <p>Continuous recognition mode</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-400" />
              <span>LLM Integration</span>
            </CardTitle>
          <CardContent>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Configure Ollama, OpenAI, or other LLM in Settings</p>
              <p>AI responses use ikubaysan format</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Voice Session History</span>
          </CardTitle>
          <CardDescription>Recent voice sessions and AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No voice sessions recorded yet</p>
              <p className="text-sm mt-2">Start a voice session to see results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Session {session.id.slice(-4)}</span>
                    <Badge variant="outline">{Math.round(session.duration / 1000)}s</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Transcription:</span>
                      <p className="font-mono text-xs">{session.transcriptions[0]}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">AI Response:</span>
                      <p className="font-mono text-xs">{session.responses[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VoiceControl
