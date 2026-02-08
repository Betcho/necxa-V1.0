
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  created_at: string;
  messages: Message[];
}

export interface AnalyticsData {
  date: string;
  messages: number;
  tokens?: number;
}

export enum CerebrasModel {
  LLAMA_3_1_8B = 'llama3.1-8b',
  LLAMA_3_1_70B = 'llama3.1-70b'
}
