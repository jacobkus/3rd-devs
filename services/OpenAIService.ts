import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async completion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-4o',
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      return this.openai.chat.completions.create({
        messages,
        model,
      });
    } catch (error) {
      console.error('Error in OpenAI completion:', error);
      throw error;
    }
  }
}
