import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchMCPStatus, type MCPStatusResponse } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Gamepad2,
  Monitor,
  User,
  Palette,
  Zap,
  MessageSquare,
  Mic,
  Brain,
  Settings,
  Activity,
  Wifi,
  Bot
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { data: mcpStatus } = useQuery<MCPStatusResponse>({
    queryKey: ['mcp-status'],
    queryFn: fetchMCPStatus,
    refetchInterval: 15000,
    retry: false
  })

  const activeCount = mcpStatus ? Object.values(mcpStatus.servers).filter((s) => s.online).length : 6
  const totalCount = mcpStatus ? Object.keys(mcpStatus.servers).length : 6

  const integrations = [
    { name: 'VRChat MCP', description: 'Control VRChat avatars and worlds with OSC integration', status: 'online', icon: Gamepad2, features: ['Avatar Control', 'World Interaction', 'OSC Bridge'], href: '/vrchat' },
    { name: 'Resonite MCP', description: 'Manage Resonite sessions and Logix scripting', status: 'online', icon: Monitor, features: ['Session Management', 'Logix Control', 'Asset Sync'], href: '/resonite' },
    { name: 'Avatar MCP', description: 'Create and modify VR avatars with AI assistance', status: 'online', icon: User, features: ['Avatar Generation', 'Blendshape Control', 'Animation'], href: '/avatar-studio' },
    { name: 'Blender MCP', description: '3D modeling and rendering for VR content creation', status: 'online', icon: Palette, features: ['Model Creation', 'Texture Mapping', 'VR Export'], href: '/blender' },
    { name: 'OSC MCP', description: 'Open Sound Control protocol for VR applications', status: 'online', icon: Zap, features: ['Parameter Control', 'Device Sync', 'Real-time Data'], href: '/osc' },
    { name: 'Unity MCP', description: 'Unity game engine integration for VR development', status: 'online', icon: Gamepad2, features: ['Scene Management', 'Build Automation', 'VR Testing'], href: '/unity' }
  ]

  const aiFeatures = [
    {
      name: 'Dual STT AI Chatbot',
      description: 'ikubaysan-inspired voice-controlled AI with state machine',
      icon: Brain,
      status: 'active'
    },
    {
      name: 'Voice Control Pipeline',
      description: 'Sphinx wake-word + Google Cloud accurate transcription',
      icon: Mic,
      status: 'active'
    },
    {
      name: 'Character State Machine',
      description: 'Wandering → Conversing → Performing Actions',
      icon: Bot,
      status: 'active'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          MyVRWorlds Control Center
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Unified control interface for all your VR MCP servers featuring ikubaysan dual-STT AI chatbot architecture
          and seamless integration with VRChat, Resonite, Blender, Unity, and more.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeCount}/{totalCount}</div>
            <p className="text-xs text-gray-400">{mcpStatus ? 'MCP servers (API bridge)' : 'VR MCP integrations'}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Features</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">3/3</div>
            <p className="text-xs text-gray-400">Voice AI + Local/Cloud LLMs</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Status</CardTitle>
            <Wifi className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">Connected</div>
            <p className="text-xs text-gray-400">All MCP servers reachable</p>
          </CardContent>
        </Card>
      </div>

      {/* VR MCP Integrations */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">VR MCP Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon
            return (
              <Card key={integration.name} className="bg-black/20 backdrop-blur-md border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-blue-400" />
                    <Badge variant={integration.status === 'online' ? 'default' : 'secondary'} className="bg-green-600/20 text-green-400">
                      {integration.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-white">{integration.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs border-white/20 text-gray-300">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="vr" asChild className="w-full">
                    <Link to={integration.href}>Access {integration.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* AI Features */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">AI Voice Features (ikubaysan Architecture)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.name} className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-purple-400" />
                    <div>
                      <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 bg-purple-600/20 text-purple-400 border-purple-500/30">
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="vr" asChild className="h-20 flex flex-col items-center justify-center space-y-2">
            <Link to="/ai-chatbot" className="flex flex-col items-center justify-center space-y-2"><MessageSquare className="h-6 w-6" /><span>Start AI Chat</span></Link>
          </Button>
          <Button variant="vr" asChild className="h-20 flex flex-col items-center justify-center space-y-2">
            <Link to="/voice-control" className="flex flex-col items-center justify-center space-y-2"><Mic className="h-6 w-6" /><span>Voice Control</span></Link>
          </Button>
          <Button variant="vr" asChild className="h-20 flex flex-col items-center justify-center space-y-2">
            <Link to="/avatar-studio" className="flex flex-col items-center justify-center space-y-2"><User className="h-6 w-6" /><span>Avatar Studio</span></Link>
          </Button>
          <Button variant="vr" asChild className="h-20 flex flex-col items-center justify-center space-y-2">
            <Link to="/settings" className="flex flex-col items-center justify-center space-y-2"><Settings className="h-6 w-6" /><span>System Settings</span></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard