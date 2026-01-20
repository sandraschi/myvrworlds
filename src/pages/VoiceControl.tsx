import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Mic,
  MicOff,
  Volume2,
  Zap,
  Brain,
  Activity,
  Settings,
  Play,
  Square,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VoiceSession {
  id: string
  startTime: Date
  wakeWords: string[]
  transcriptions: string[]
  responses: string[]
  duration: number
}

const VoiceControl: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [sphinxActive, setSphinxActive] = useState(false)
  const [googleCloudActive, setGoogleCloudActive] = useState(false)
  const [currentWakeWord, setCurrentWakeWord] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [sessions, setSessions] = useState<VoiceSession[]>([])
  const { toast } = useToast()

  const startVoiceSession = () => {
    setIsRecording(true)
    setSphinxActive(true)
    setCurrentWakeWord(null)
    setAudioLevel(0)

    toast({
      title: "Voice Session Started",
      description: "Sphinx wake-word detection is now active",
    })

    // Simulate audio level monitoring
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100)
    }, 100)

    // Simulate wake word detection after 2-5 seconds
    const wakeWordDelay = Math.random() * 3000 + 2000
    setTimeout(() => {
      const wakeWords = ['ringo', 'hey ringo', 'listen ringo']
      const detectedWord = wakeWords[Math.floor(Math.random() * wakeWords.length)]
      setCurrentWakeWord(detectedWord)
      setSphinxActive(false)
      setGoogleCloudActive(true)

      toast({
        title: "Wake Word Detected!",
        description: `Sphinx detected: "${detectedWord}" - Switching to Google Cloud STT`,
      })

      // Simulate Google Cloud processing
      setTimeout(() => {
        setGoogleCloudActive(false)
        setIsRecording(false)
        clearInterval(interval)
        setAudioLevel(0)

        // Add session to history
        const newSession: VoiceSession = {
          id: Date.now().toString(),
          startTime: new Date(Date.now() - 8000),
          wakeWords: [detectedWord],
          transcriptions: ['Hello ringo, how are you doing today?'],
          responses: ['TYPE_NORMAL I\'m doing well, thank you for asking! How can I help you today?'],
          duration: 8000
        }
        setSessions(prev => [newSession, ...prev.slice(0, 9)]) // Keep last 10 sessions

        toast({
          title: "Voice Session Complete",
          description: "Transcription processed and AI response generated",
        })
      }, 3000)
    }, wakeWordDelay)

    // Cleanup interval after session
    setTimeout(() => clearInterval(interval), 8000)
  }

  const stopVoiceSession = () => {
    setIsRecording(false)
    setSphinxActive(false)
    setGoogleCloudActive(false)
    setCurrentWakeWord(null)
    setAudioLevel(0)

    toast({
      title: "Voice Session Stopped",
      description: "Voice processing deactivated",
    })
  }

  const getSphinxStatus = () => {
    if (!isRecording) return { status: 'inactive', color: 'bg-gray-500' }
    if (sphinxActive) return { status: 'listening', color: 'bg-blue-500 animate-pulse' }
    return { status: 'wake detected', color: 'bg-green-500' }
  }

  const getGoogleCloudStatus = () => {
    if (!googleCloudActive) return { status: 'standby', color: 'bg-gray-500' }
    return { status: 'processing', color: 'bg-purple-500 animate-pulse' }
  }

  const sphinxStatus = getSphinxStatus()
  const googleStatus = getGoogleCloudStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Voice Control System
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Dual STT Architecture: Sphinx wake-word detection + Google Cloud accurate transcription.
          Real-time voice processing for VR AI characters.
        </p>
      </div>

      {/* Control Panel */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-6 w-6" />
            <span>Voice Processing Control</span>
          </CardTitle>
          <CardDescription>
            Start a voice session to experience the dual STT pipeline in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant={isRecording ? "destructive" : "vr"}
              onClick={isRecording ? stopVoiceSession : startVoiceSession}
              className="flex items-center space-x-2"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span>{isRecording ? 'Stop Session' : 'Start Voice Session'}</span>
            </Button>

            <Button variant="outline" disabled={isRecording}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Audio Level Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Audio Input Level</span>
              <span className="text-sm text-gray-400">{Math.round(audioLevel)}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* STT Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span>Sphinx Wake-Word Detection</span>
            </CardTitle>
            <CardDescription>
              Fast, offline keyword spotting for character activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant="outline" className={`${sphinxStatus.color} text-white border-0`}>
                  {sphinxStatus.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Wake Words</span>
                <div className="flex flex-wrap gap-2">
                  {['ringo', 'hey ringo', 'listen ringo'].map(word => (
                    <Badge
                      key={word}
                      variant={currentWakeWord === word ? "default" : "secondary"}
                      className={currentWakeWord === word ? "bg-green-600" : ""}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-400">
                <p>• Always listening (low CPU)</p>
                <p>• Triggers conversation state</p>
                <p>• PocketSphinx engine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span>Google Cloud STT</span>
            </CardTitle>
            <CardDescription>
              High-accuracy speech-to-text for full conversation processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant="outline" className={`${googleStatus.color} text-white border-0`}>
                  {googleStatus.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Capabilities</span>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Full sentence transcription</p>
                  <p>• Multiple language support</p>
                  <p>• Context-aware processing</p>
                  <p>• Noise cancellation</p>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                <p>• Activated after wake word</p>
                <p>• Higher accuracy than Sphinx</p>
                <p>• Cloud-based processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Voice Session History</span>
          </CardTitle>
          <CardDescription>
            Recent voice processing sessions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No voice sessions recorded yet</p>
              <p className="text-sm mt-2">Start a voice session to see processing results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Session {session.id.slice(-4)}
                    </span>
                    <Badge variant="outline">
                      {Math.round(session.duration / 1000)}s
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Wake Word:</span>
                      <p className="font-mono">{session.wakeWords[0]}</p>
                    </div>
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

      {/* Architecture Details */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Dual STT Pipeline Architecture</CardTitle>
          <CardDescription>
            How the two-stage voice processing system works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-400">Stage 1: Wake Word Detection</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>PocketSphinx running continuously</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Low CPU usage (~1-2%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Keyword spotting for character names</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Triggers state transition to 'conversing'</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-blue-400">Stage 2: Accurate Transcription</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Google Cloud Speech API activation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>High accuracy transcription</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Full sentence processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Context-aware language understanding</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Why Dual STT?</h4>
              <p className="text-sm text-gray-400">
                The dual architecture solves the fundamental trade-off between speed and accuracy.
                Sphinx provides instant wake-word detection with minimal resources, while Google Cloud
                delivers professional-grade transcription when full context is needed. This enables
                natural, responsive voice interactions in VR environments where both speed and accuracy matter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VoiceControl