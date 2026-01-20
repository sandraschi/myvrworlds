import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Settings as SettingsIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { LLMService, LLMProvider, LLMConfig } from '@/services/llmService'

interface LLMConfigProps {
  onConfigChange?: (config: LLMConfig) => void
  initialConfig?: LLMConfig
  compact?: boolean
}

const LLMConfig: React.FC<LLMConfigProps> = ({
  onConfigChange,
  initialConfig,
  compact = false
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [baseUrl, setBaseUrl] = useState<string>('')
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(1000)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  const providers = Object.values(LLMService.PROVIDERS)
  const currentProvider = providers.find(p => p.id === selectedProvider)

  useEffect(() => {
    if (initialConfig) {
      setSelectedProvider(initialConfig.provider)
      setSelectedModel(initialConfig.model)
      setApiKey(initialConfig.apiKey || '')
      setBaseUrl(initialConfig.baseUrl || '')
      setTemperature(initialConfig.temperature || 0.7)
      setMaxTokens(initialConfig.maxTokens || 1000)
    }
  }, [initialConfig])

  useEffect(() => {
    if (selectedProvider) {
      const provider = LLMService.PROVIDERS[selectedProvider]
      setBaseUrl(baseUrl || provider.defaultBaseUrl || '')
      setSelectedModel(selectedModel || provider.defaultModel)

      // Load available models for this provider
      loadAvailableModels()
    }
  }, [selectedProvider])

  const loadAvailableModels = async () => {
    if (!selectedProvider) return

    try {
      const llmService = LLMService.getInstance()
      llmService.configure({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined
      })

      const models = await llmService.getAvailableModels()
      setAvailableModels(models.length > 0 ? models : [LLMService.PROVIDERS[selectedProvider].defaultModel])
    } catch (error) {
      console.error('Error loading models:', error)
      setAvailableModels([LLMService.PROVIDERS[selectedProvider].defaultModel])
    }
  }

  const handleTestConnection = async () => {
    if (!selectedProvider || !selectedModel) {
      toast({
        title: "Configuration Incomplete",
        description: "Please select a provider and model first.",
        variant: "destructive"
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const llmService = LLMService.getInstance()
      llmService.configure({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        temperature,
        maxTokens
      })

      const result = await llmService.testConnection()
      setTestResult(result)

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message,
        })

        // Update available models if we got them from the test
        if (result.models) {
          setAvailableModels(result.models)
        }
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult({ success: false, message: errorMessage })
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveConfig = () => {
    if (!selectedProvider || !selectedModel) {
      toast({
        title: "Configuration Incomplete",
        description: "Please select a provider and model.",
        variant: "destructive"
      })
      return
    }

    const config: LLMConfig = {
      provider: selectedProvider,
      model: selectedModel,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
      temperature,
      maxTokens
    }

    // Configure the LLM service
    const llmService = LLMService.getInstance()
    llmService.configure(config)

    // Save to localStorage for persistence
    localStorage.setItem('myvrworlds-llm-config', JSON.stringify(config))

    onConfigChange?.(config)

    toast({
      title: "Configuration Saved",
      description: `LLM provider set to ${LLMService.PROVIDERS[selectedProvider].name} with ${selectedModel}`,
    })
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentProvider?.requiresApiKey && (
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button onClick={handleTestConnection} disabled={isTesting} size="sm">
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test
          </Button>
          <Button onClick={handleSaveConfig} variant="vr" size="sm">
            Save
          </Button>
        </div>

        {testResult && (
          <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SettingsIcon className="h-5 w-5" />
          <span>LLM Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure your AI language model for voice chat and VR interactions. Supports both local and cloud providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select an AI provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center space-x-3">
                    <span>{provider.icon}</span>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-gray-400">{provider.description}</div>
                    </div>
                    <Badge variant={provider.type === 'local' ? 'default' : 'secondary'} className="ml-auto">
                      {provider.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentProvider && (
          <>
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* API Key (for cloud providers) */}
            {currentProvider.requiresApiKey && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${currentProvider.name} API key`}
                />
              </div>
            )}

            {/* Base URL (optional) */}
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL (Optional)</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={currentProvider.defaultBaseUrl || "Custom endpoint URL"}
              />
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="8000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Test Connection */}
            <div className="flex items-center space-x-4 pt-4">
              <Button onClick={handleTestConnection} disabled={isTesting}>
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
              <Button onClick={handleSaveConfig} variant="vr">
                Save Configuration
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Provider Info */}
        {currentProvider && (
          <div className="bg-black/10 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">{currentProvider.name} Information</h4>
            <div className="text-sm text-gray-400 space-y-1">
              <p><strong>Type:</strong> {currentProvider.type === 'local' ? '🏠 Local (runs on your machine)' : '☁️ Cloud (requires internet)'}</p>
              <p><strong>API Key:</strong> {currentProvider.requiresApiKey ? 'Required' : 'Not required'}</p>
              <p><strong>Default Model:</strong> {currentProvider.defaultModel}</p>
              <p><strong>Privacy:</strong> {currentProvider.type === 'local' ? 'All data stays on your machine' : 'Data sent to provider servers'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LLMConfig