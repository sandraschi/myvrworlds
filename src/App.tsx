import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import Dashboard from '@/pages/Dashboard'
import VRChatControl from '@/pages/VRChatControl'
import ResoniteControl from '@/pages/ResoniteControl'
import AvatarStudio from '@/pages/AvatarStudio'
import BlenderIntegration from '@/pages/BlenderIntegration'
import OSCControl from '@/pages/OSCControl'
import UnityIntegration from '@/pages/UnityIntegration'
import AIChatbot from '@/pages/AIChatbot'
import VoiceControl from '@/pages/VoiceControl'
import Settings from '@/pages/Settings'
import Layout from '@/components/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="myvrworlds-theme">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vrchat" element={<VRChatControl />} />
              <Route path="/resonite" element={<ResoniteControl />} />
              <Route path="/avatar-studio" element={<AvatarStudio />} />
              <Route path="/blender" element={<BlenderIntegration />} />
              <Route path="/osc" element={<OSCControl />} />
              <Route path="/unity" element={<UnityIntegration />} />
              <Route path="/ai-chatbot" element={<AIChatbot />} />
              <Route path="/voice-control" element={<VoiceControl />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App