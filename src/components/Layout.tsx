import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor, Gamepad2, User, Palette, Zap, Settings, MessageSquare, Mic } from 'lucide-react'
import { useTheme } from 'next-themes'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Monitor },
  { name: 'VRChat', href: '/vrchat', icon: Gamepad2 },
  { name: 'Resonite', href: '/resonite', icon: Monitor },
  { name: 'Avatar Studio', href: '/avatar-studio', icon: User },
  { name: 'Blender', href: '/blender', icon: Palette },
  { name: 'OSC Control', href: '/osc', icon: Zap },
  { name: 'Unity', href: '/unity', icon: Gamepad2 },
  { name: 'AI Chatbot', href: '/ai-chatbot', icon: MessageSquare },
  { name: 'Voice Control', href: '/voice-control', icon: Mic },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MyVRWorlds
              </h1>
              <span className="ml-2 text-sm text-gray-400">VR Control Center</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-black/20 backdrop-blur-md border-r border-white/10 min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout