// types.ts
export interface ProviderConfig {
  apiUrl: string;
  apiKey: string;
  defaultModel: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatConfig {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
}
