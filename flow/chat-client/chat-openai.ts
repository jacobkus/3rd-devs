import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
} from 'openai/resources/chat/completions';
import type { ChatClient } from 'flow/chat-client/chat-client.interface';
import type { BaseMessage } from 'flow/message/base-message.interface';

export class ChatOpenAI implements ChatClient {
  private client: OpenAI;
  private readonly params: Omit<ChatCompletionCreateParamsBase, 'messages'>;

  constructor(params: Omit<ChatCompletionCreateParamsBase, 'messages'>) {
    this.client = new OpenAI();
    this.params = params;
  }

  async predict(messages: BaseMessage[]) {
    const response = (await this.client.chat.completions.create({
      ...this.params,
      messages,
    } as ChatCompletionCreateParamsBase)) as ChatCompletion;

    return {
      content: response.choices[0].message.content ?? '',
      raw: response,
    };
  }
}
