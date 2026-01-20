import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, Server, Key, Wifi, Brain } from 'lucide-react'
import LLMConfig from '@/components/LLMConfig'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Configure MCP server connections, API keys, and AI language models for VR interactions.
        </p>
      </div>

      {/* LLM Configuration */}
      <LLMConfig />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>MCP Server Config</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Configure connections to VR MCP servers</p>
            <Button variant="outline" className="w-full">Server Settings</Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span>Network Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Configure OSC ports and VR application connections</p>
            <Button variant="outline" className="w-full">Network Config</Button>
          </CardContent>
        </Card>
      </div>

      {/* VR System Info */}
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>VR Integration Status</span>
          </CardTitle>
          <CardDescription>
            Current status of VR MCP servers and voice processing systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🤖</div>
              <div className="text-sm font-medium">Avatar MCP</div>
              <div className="text-xs text-gray-400">Ready</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎨</div>
              <div className="text-sm font-medium">Blender MCP</div>
              <div className="text-xs text-gray-400">Ready</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎮</div>
              <div className="text-sm font-medium">VRChat MCP</div>
              <div className="text-xs text-gray-400">Ready</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎙️</div>
              <div className="text-sm font-medium">Voice AI</div>
              <div className="text-xs text-gray-400">Configured</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings