/**
 * LLM Service for MyVRWorlds
 *
 * Integrates with the myai LLM integration system to support multiple providers:
 * - Local: Ollama, LM Studio
 * - Cloud: OpenAI, Anthropic, Google Gemini
 */

export interface LLMProvider {
  id: string
  name: string
  type: 'local' | 'cloud'
  description: string
  requiresApiKey: boolean
  defaultBaseUrl?: string
  defaultModel: string
  icon: string
}

export interface LLMConfig {
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  responseType?: string
  tokensUsed?: number
  model: string
  provider: string
}

export class LLMService {
  private static instance: LLMService
  private currentConfig: LLMConfig | null = null

  // Available LLM providers
  public static readonly PROVIDERS: Record<string, LLMProvider> = {
    ollama: {
      id: 'ollama',
      name: 'Ollama',
      type: 'local',
      description: 'Local LLM server for running models like Llama, Mistral, etc.',
      requiresApiKey: false,
      defaultBaseUrl: 'http://localhost:11434',
      defaultModel: 'llama2',
      icon: '🦙'
    },
    lmstudio: {
      id: 'lmstudio',
      name: 'LM Studio',
      type: 'local',
      description: 'Local LLM server with web UI for easy model management',
      requiresApiKey: false,
      defaultBaseUrl: 'http://localhost:1234',
      defaultModel: 'local-model',
      icon: '🎯'
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      type: 'cloud',
      description: 'GPT models from OpenAI (GPT-4, GPT-3.5-turbo)',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4',
      icon: '🤖'
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic',
      type: 'cloud',
      description: 'Claude models from Anthropic',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.anthropic.com',
      defaultModel: 'claude-3-sonnet-20240229',
      icon: '🧠'
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      type: 'cloud',
      description: 'Gemini models from Google',
      requiresApiKey: true,
      defaultBaseUrl: 'https://generativelanguage.googleapis.com',
      defaultModel: 'gemini-pro',
      icon: '🌟'
    }
  }

  private constructor() {}

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService()
    }
    return LLMService.instance
  }

  /**
   * Configure the LLM service with provider settings
   */
  public configure(config: LLMConfig): void {
    this.currentConfig = config
  }

  /**
   * Get current configuration
   */
  public getConfig(): LLMConfig | null {
    return this.currentConfig
  }

  /**
   * Generate AI response using configured LLM
   */
  public async generateResponse(
    prompt: string,
    systemPrompt?: string,
    temperature?: number
  ): Promise<AIResponse> {
    if (!this.currentConfig) {
      throw new Error('LLM service not configured')
    }

    const config = this.currentConfig

    try {
      // For development/demo, use mock API
      // In production, replace with actual API call to myai LLM integration service
      const { mockApi } = await import('./mockApi')

      const result = await mockApi.generate({
        ...config,
        prompt,
        systemPrompt,
        temperature: temperature || config.temperature || 0.7,
        maxTokens: config.maxTokens || 1000
      })

      return result

      // Production API call (commented out for now):
      /*
      const response = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: config.provider,
          model: config.model,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          prompt,
          systemPrompt,
          temperature: temperature || config.temperature || 0.7,
          maxTokens: config.maxTokens || 1000
        })
      })

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.content,
        responseType: data.responseType,
        tokensUsed: data.tokensUsed,
        model: config.model,
        provider: config.provider
      }
      */
    } catch (error) {
      console.error('LLM generation error:', error)
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate ikubaysan-style structured response for VR chatbot
   */
  public async generateStructuredResponse(
    userMessage: string,
    characterName: string = 'ringo',
    conversationContext?: string[]
  ): Promise<AIResponse> {
    const systemPrompt = `You're ${characterName}, an AI in VR talking to humans. You will add a special prefix to your responses. If you don't understand a prompt, prefix = TYPE_CONFUSED. If the prompt indicates departure or conversation end, prefix = TYPE_ENDING. If you're expressing agreement, correctness, or yes, prefix = TYPE_YES. If you're expressing disagreement, incorrectness, or no, prefix = TYPE_NO. If the prompt is a command to move or perform an action, prefix = TYPE_CMD_[ACTION]. Otherwise, prefix = TYPE_NORMAL. All of your previous messages, if any, followed this format.

Available commands:
- TYPE_CMD_TURN_LEFT: Turn left
- TYPE_CMD_TURN_RIGHT: Turn right
- TYPE_CMD_FORWARD: Move forward
- TYPE_CMD_BACK: Move backward
- TYPE_CMD_STOP: Stop current action

${conversationContext ? `Conversation history:\n${conversationContext.join('\n')}\n\n` : ''}Transcription: ${userMessage}`

    return this.generateResponse(userMessage, systemPrompt, 0.5)
  }

  /**
   * Test connection to configured LLM provider
   */
  public async testConnection(): Promise<{ success: boolean; message: string; models?: string[] }> {
    if (!this.currentConfig) {
      return { success: false, message: 'LLM service not configured' }
    }

    try {
      // For development/demo, use mock API
      // In production, replace with actual API call
      const { mockApi } = await import('./mockApi')
      return await mockApi.testConnection(this.currentConfig)

      // Production API call (commented out for now):
      /*
      const response = await fetch('/api/llm/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.currentConfig)
      })

      if (!response.ok) {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      return {
        success: true,
        message: data.message || 'Connection successful',
        models: data.models
      }
      */
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get available models for current provider
   */
  public async getAvailableModels(): Promise<string[]> {
    if (!this.currentConfig) {
      return []
    }

    try {
      // For development/demo, use mock API
      // In production, replace with actual API call
      const { mockApi } = await import('./mockApi')
      return await mockApi.getModels(this.currentConfig)

      // Production API call (commented out for now):
      /*
      const response = await fetch('/api/llm/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.currentConfig.provider,
          apiKey: this.currentConfig.apiKey,
          baseUrl: this.currentConfig.baseUrl
        })
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.models || []
      */
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  }
}

export const llmService = LLMService.getInstance()
export default llmService