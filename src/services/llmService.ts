/**
 * LLM Service for MyVRWorlds
 *
 * Real API integration for multiple providers:
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

  public static readonly PROVIDERS: Record<string, LLMProvider> = {
    ollama: {
      id: 'ollama',
      name: 'Ollama',
      type: 'local',
      description: 'Local LLM server for running models like Llama, Mistral, etc.',
      requiresApiKey: false,
      defaultBaseUrl: 'http://localhost:11434',
      defaultModel: 'llama2',
      icon: 'LL'
    },
    lmstudio: {
      id: 'lmstudio',
      name: 'LM Studio',
      type: 'local',
      description: 'Local LLM server with web UI for easy model management',
      requiresApiKey: false,
      defaultBaseUrl: 'http://localhost:1234',
      defaultModel: 'local-model',
      icon: 'LS'
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      type: 'cloud',
      description: 'GPT models from OpenAI (GPT-4, GPT-3.5-turbo)',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4',
      icon: 'AI'
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic',
      type: 'cloud',
      description: 'Claude models from Anthropic',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.anthropic.com',
      defaultModel: 'claude-3-sonnet-20240229',
      icon: 'CL'
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      type: 'cloud',
      description: 'Gemini models from Google',
      requiresApiKey: true,
      defaultBaseUrl: 'https://generativelanguage.googleapis.com',
      defaultModel: 'gemini-pro',
      icon: 'GM'
    }
  }

  private constructor() {}

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService()
    }
    return LLMService.instance
  }

  public configure(config: LLMConfig): void {
    this.currentConfig = config
  }

  public getConfig(): LLMConfig | null {
    return this.currentConfig
  }

  public async generateResponse(
    prompt: string,
    systemPrompt?: string,
    temperature?: number
  ): Promise<AIResponse> {
    if (!this.currentConfig) {
      throw new Error('LLM service not configured')
    }
    const config = this.currentConfig
    const temp = temperature ?? config.temperature ?? 0.7
    const maxTokens = config.maxTokens ?? 1000

    switch (config.provider) {
      case 'ollama':
        return this.generateOllama(config, prompt, systemPrompt, temp, maxTokens)
      case 'lmstudio':
      case 'openai':
        return this.generateOpenAICompatible(config, prompt, systemPrompt, temp, maxTokens)
      case 'anthropic':
        return this.generateAnthropic(config, prompt, systemPrompt, temp, maxTokens)
      case 'gemini':
        return this.generateGemini(config, prompt, systemPrompt, temp, maxTokens)
      default:
        throw new Error(`Unknown provider: ${config.provider}`)
    }
  }

  private async generateOllama(
    config: LLMConfig,
    prompt: string,
    systemPrompt: string | undefined,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const baseUrl = config.baseUrl ?? 'http://localhost:11434'
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: fullPrompt,
        stream: false,
        options: { temperature, num_predict: maxTokens }
      })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Ollama error: ${res.status} - ${err}`)
    }
    const data = (await res.json()) as { response: string; eval_count?: number }
    return {
      content: data.response.trim(),
      tokensUsed: data.eval_count,
      model: config.model,
      provider: 'ollama'
    }
  }

  private async generateOpenAICompatible(
    config: LLMConfig,
    prompt: string,
    systemPrompt: string | undefined,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    let base = config.baseUrl ?? (config.provider === 'openai' ? 'https://api.openai.com/v1' : 'http://localhost:1234')
    if (config.provider === 'lmstudio' && !base.endsWith('/v1')) base = base.replace(/\/?$/, '') + '/v1'
    if (config.provider === 'openai' && !base.endsWith('/v1')) base = base.replace(/\/?$/, '') + '/v1'
    const url = `${base.replace(/\/$/, '')}/chat/completions`
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`

    const messages: Array<{ role: string; content: string }> = []
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
    messages.push({ role: 'user', content: prompt })

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenAI/LM Studio error: ${res.status} - ${err}`)
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      usage?: { total_tokens?: number }
    }
    const content = data.choices?.[0]?.message?.content ?? ''
    return {
      content,
      tokensUsed: data.usage?.total_tokens,
      model: config.model,
      provider: config.provider
    }
  }

  private async generateAnthropic(
    config: LLMConfig,
    prompt: string,
    systemPrompt: string | undefined,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const apiKey = config.apiKey
    if (!apiKey) throw new Error('Anthropic API key required')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        system: systemPrompt ?? '',
        messages: [{ role: 'user', content: prompt }]
      })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic error: ${res.status} - ${err}`)
    }
    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>
      usage?: { output_tokens?: number; input_tokens?: number }
    }
    const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
    const tokensUsed = (data.usage?.output_tokens ?? 0) + (data.usage?.input_tokens ?? 0)
    return { content: text, tokensUsed, model: config.model, provider: 'anthropic' }
  }

  private async generateGemini(
    config: LLMConfig,
    prompt: string,
    systemPrompt: string | undefined,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const apiKey = config.apiKey
    if (!apiKey) throw new Error('Gemini API key required')

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: config.model })

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    })
    const response = result.response
    const text = response.text() ?? ''
    return {
      content: text,
      model: config.model,
      provider: 'gemini'
    }
  }

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

  public async testConnection(): Promise<{ success: boolean; message: string; models?: string[] }> {
    if (!this.currentConfig) {
      return { success: false, message: 'LLM service not configured' }
    }
    const config = this.currentConfig

    try {
      if (config.provider === 'ollama') {
        const baseUrl = config.baseUrl ?? 'http://localhost:11434'
        const res = await fetch(`${baseUrl}/api/tags`)
        if (!res.ok) {
          return { success: false, message: `Ollama not reachable: ${res.status}` }
        }
        const data = (await res.json()) as { models?: Array<{ name: string }> }
        const models = data.models?.map((m) => m.name.split(':')[0]) ?? [config.model]
        return { success: true, message: 'Connected to Ollama', models }
      }

      if (config.provider === 'lmstudio') {
        const baseUrl = config.baseUrl ?? 'http://localhost:1234'
        const res = await fetch(`${baseUrl}/v1/models`)
        if (!res.ok) {
          return { success: false, message: `LM Studio not reachable: ${res.status}` }
        }
        const data = (await res.json()) as { data?: Array<{ id: string }> }
        const models = data.data?.map((m) => m.id) ?? [config.model]
        return { success: true, message: 'Connected to LM Studio', models }
      }

      if (config.provider === 'openai') {
        if (!config.apiKey) return { success: false, message: 'OpenAI API key required' }
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${config.apiKey}` }
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
          return { success: false, message: err?.error?.message ?? `OpenAI error: ${res.status}` }
        }
        const data = (await res.json()) as { data?: Array<{ id: string }> }
        const models = data.data?.slice(0, 20).map((m) => m.id) ?? []
        return { success: true, message: 'Connected to OpenAI', models }
      }

      if (config.provider === 'anthropic') {
        if (!config.apiKey) return { success: false, message: 'Anthropic API key required' }
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
          return { success: false, message: err?.error?.message ?? `Anthropic error: ${res.status}` }
        }
        return { success: true, message: 'Connected to Anthropic' }
      }

      if (config.provider === 'gemini') {
        if (!config.apiKey) return { success: false, message: 'Gemini API key required' }
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(config.apiKey)
        const model = genAI.getGenerativeModel({ model: config.model })
        await model.generateContent('Hi')
        return { success: true, message: 'Connected to Gemini' }
      }

      return { success: false, message: `Unknown provider: ${config.provider}` }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, message: msg }
    }
  }

  public async getAvailableModels(): Promise<string[]> {
    if (!this.currentConfig) return []
    const result = await this.testConnection()
    return result.models ?? [this.currentConfig.model]
  }
}

export const llmService = LLMService.getInstance()
export default llmService
