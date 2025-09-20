import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';
  private apiKey: string = '';

  constructor() {
    // Get API key from environment or localStorage
    this.apiKey = this.getApiKey();
  }

  private getApiKey(): string {
    // First check localStorage for user-provided API key
    const storedKey = localStorage.getItem('openai-api-key');
    if (storedKey) {
      return storedKey;
    }

    // For development, you can set your API key here temporarily
    // NEVER commit your actual API key to version control
    return ''; // Add your API key here for testing
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('openai-api-key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async getReflection(prompt: string): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a thoughtful reflection assistant. Help users think deeper about their notes by providing insights, asking thought-provoking questions, and suggesting different perspectives. Keep responses concise but meaningful, around 150-200 words.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('No response received from ChatGPT');
      }
    } catch (error) {
      console.error('ChatGPT API error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Mock method for development/testing without API key
  async getMockReflection(prompt: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return `Here are some thoughtful reflections on your note:

🤔 **Key Insights:**
Your writing reveals some interesting patterns and themes worth exploring further.

❓ **Questions to Consider:**
- What emotions or experiences might have influenced these thoughts?
- How do these ideas connect to your broader goals or values?
- What would you want to explore more deeply?

💡 **Different Perspectives:**
Consider looking at this from the viewpoint of someone with different experiences or cultural background.

✅ **Potential Next Steps:**
You might want to research related topics, discuss with others, or write a follow-up reflection.

This is a demo response since no API key is configured. Add your OpenAI API key to get real ChatGPT reflections!`;
  }
}
