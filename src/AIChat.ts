// AIChat.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ProviderConfig, Message, ChatConfig } from './types';
import { TextDecoder } from 'util';

export class AIChat {
  private axios: AxiosInstance;
  private config: ProviderConfig;
  private conversationHistory: Message[] = [];

  constructor(config: ProviderConfig, initialSystemMessage?: string) {
    this.config = config;

    this.axios = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (initialSystemMessage) {
      this.conversationHistory.push({
        role: 'system',
        content: initialSystemMessage,
      });
    }
  }

  async sendMessage(message: string, config?: ChatConfig): Promise<string> {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const response = await this.axios.post('', {
        model: config?.model || this.config.defaultModel,
        messages: this.conversationHistory,
        temperature: config?.temperature || 0.7,
        max_tokens: config?.maxTokens || 150,
        stream: config?.stream || false,
      });

      const assistantMessage = response.data.choices[0].message;
      this.conversationHistory.push(assistantMessage);

      return assistantMessage.content;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // AIChat.ts
  // Add this new method
  async sendStreamingMessage(
    message: string,
    onChunk: (chunk: string) => void,
    config?: ChatConfig
  ): Promise<void> {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const response = await this.axios.post(
        '',
        {
          model: config?.model || this.config.defaultModel,
          messages: this.conversationHistory,
          temperature: config?.temperature || 0.7,
          max_tokens: config?.maxTokens || 150,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      let fullResponse = '';

      // Create decoder for parsing the chunks
      const decoder = new TextDecoder();

      for await (const chunk of response.data) {
        const lines = decoder.decode(chunk).split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices[0].delta?.content) {
                const content = data.choices[0].delta.content;
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async streamMessage(
    message: string,
    onChunk: (chunk: string) => void,
    config?: ChatConfig
  ): Promise<void> {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const response = await this.axios.post(
        '',
        {
          model: config?.model || this.config.defaultModel,
          messages: this.conversationHistory,
          temperature: config?.temperature || 0.7,
          max_tokens: config?.maxTokens || 150,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      let fullResponse = '';
      for await (const chunk of response.data) {
        const chunkText = this.parseStreamChunk(chunk);
        if (chunkText) {
          fullResponse += chunkText;
          onChunk(chunkText);
        }
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }

  clearConversation(): void {
    this.conversationHistory = [];
  }

  private parseStreamChunk(chunk: Buffer): string | null {
    try {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          return data.choices[0].delta.content || '';
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      throw new Error(`API Error: ${status} - ${JSON.stringify(data)}`);
    }
    throw error;
  }
}
