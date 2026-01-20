import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Zap, Users, Settings, Activity } from 'lucide-react'

const VRChatControl: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          VRChat Control Center
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Control VRChat avatars, worlds, and OSC parameters through the VRChat MCP integration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Avatar Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Real-time avatar parameter control via OSC</p>
            <Button variant="vr" className="w-full">Access Avatar Controls</Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>OSC Bridge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Monitor and manage OSC communication</p>
            <Badge variant="outline" className="bg-green-600/20 text-green-400">Connected</Badge>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>World Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Join worlds and manage instances</p>
            <Button variant="outline" className="w-full">World Browser</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VRChatControl