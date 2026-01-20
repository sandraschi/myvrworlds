/**
 * Mock API for MyVRWorlds LLM Integration
 *
 * In production, this would be replaced with actual API calls to your myai LLM integration service.
 * For now, this provides mock responses to demonstrate the integration.
 */

import { LLMConfig, AIResponse } from './llmService'

export class MockAPI {
  private static instance: MockAPI

  private constructor() {}

  public static getInstance(): MockAPI {
    if (!MockAPI.instance) {
      MockAPI.instance = new MockAPI()
    }
    return MockAPI.instance
  }

  /**
   * Mock LLM generation endpoint
   */
  async generate(config: LLMConfig & {
    prompt: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Mock structured response based on ikubaysan format
    const responses = [
      "TYPE_NORMAL I'd love to help you with that! What would you like to know about VR?",
      "TYPE_YES Absolutely, that's a great idea!",
      "TYPE_NO I'm sorry, but I can't do that right now.",
      "TYPE_CMD_TURN I'll turn to face you.",
      "TYPE_ENDING It was nice talking to you. Goodbye!",
      "TYPE_NORMAL VRChat is an amazing social platform where you can create and explore virtual worlds with friends."
    ]

    const mockResponse = responses[Math.floor(Math.random() * responses.length)]

    return {
      content: mockResponse,
      responseType: mockResponse.split(' ')[0] as any,
      tokensUsed: Math.floor(50 + Math.random() * 150),
      model: config.model,
      provider: config.provider
    }
  }

  /**
   * Mock LLM test connection endpoint
   */
  async testConnection(config: LLMConfig): Promise<{ success: boolean; message: string; models?: string[] }> {
    // Simulate connection test delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock success/failure based on configuration
    if (!config.provider || !config.model) {
      return {
        success: false,
        message: "Missing required configuration parameters"
      }
    }

    // Simulate occasional connection failures for demo purposes
    const shouldFail = Math.random() < 0.1

    if (shouldFail) {
      return {
        success: false,
        message: "Connection timeout - please check your network and API credentials"
      }
    }

    // Provide mock models based on provider
    const mockModels: Record<string, string[]> = {
      ollama: ['llama2', 'mistral', 'codellama', 'vicuna'],
      lmstudio: ['local-model-1', 'local-model-2', 'gpt2-medium'],
      openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
      anthropic: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      gemini: ['gemini-pro', 'gemini-pro-vision']
    }

    return {
      success: true,
      message: `Successfully connected to ${config.provider} API`,
      models: mockModels[config.provider] || [config.model]
    }
  }

  /**
   * Mock models endpoint
   */
  async getModels(config: Partial<LLMConfig>): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockModels: Record<string, string[]> = {
      ollama: ['llama2', 'mistral', 'codellama', 'vicuna'],
      lmstudio: ['local-model-1', 'local-model-2', 'gpt2-medium'],
      openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
      anthropic: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      gemini: ['gemini-pro', 'gemini-pro-vision']
    }

    return mockModels[config.provider || 'ollama'] || ['default-model']
  }
}

// Mock API endpoints (in a real app, these would be actual HTTP endpoints)
export const mockApi = MockAPI.getInstance()

// Override the LLM service to use mock API for development
export const setupMockAPI = () => {
  // This would normally be handled by your backend API routes
  console.log('Mock API initialized - using simulated LLM responses for development')
}