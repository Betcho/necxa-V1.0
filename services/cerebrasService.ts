import { Message } from '../types';

class CerebrasService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env.VITE_CEREBRAS_API_KEY || '';
    this.apiUrl = 'https://api.cerebras.ai/v1/chat/completions';
  }

  async chat(messages: Message[]): Promise<string> {
    try {
      // If no API key, return placeholder response
      if (!this.apiKey) {
        console.warn('VITE_CEREBRAS_API_KEY not found. Using placeholder response.');
        return 'This is a placeholder response. Please add your Cerebras API key to the environment variables.';
      }

      // Format messages for Cerebras API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`Cerebras API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response from AI';
      
    } catch (error: any) {
      console.error('Cerebras API Error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }
  }
}

export const cerebrasService = new CerebrasService();
