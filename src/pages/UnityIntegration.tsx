import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gamepad2 } from 'lucide-react'

const UnityIntegration: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Unity Integration
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Unity game engine control and VR development integration.
        </p>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
            <p className="text-gray-400">Unity MCP integration coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnityIntegration