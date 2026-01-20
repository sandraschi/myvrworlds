import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Palette, Zap, Settings } from 'lucide-react'

const AvatarStudio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Avatar Studio
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Create and customize VR avatars with AI assistance through the Avatar MCP integration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Avatar Creator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">AI-powered avatar generation and customization</p>
            <Button variant="vr" className="w-full">Create New Avatar</Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Blendshape Editor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Real-time facial animation control</p>
            <Button variant="outline" className="w-full">Open Editor</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AvatarStudio