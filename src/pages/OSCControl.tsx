import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'

const OSCControl: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          OSC Control Center
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Open Sound Control protocol management for VR applications.
        </p>
      </div>

      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
            <p className="text-gray-400">OSC MCP integration coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OSCControl