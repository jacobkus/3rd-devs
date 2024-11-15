import Anthropic from '@anthropic-ai/sdk';
import type { BaseMessage } from 'flow/message/base-message.interface';
import type { ChatClient } from 'flow/chat-client/chat-client.interface.ts';

export class ChatAnthropic implements ChatClient {
  private client: Anthropic;
  private readonly params: Partial<
    Omit<Anthropic.Messages.MessageCreateParams, 'messages'>
  >;

  constructor(
    params: Partial<Omit<Anthropic.Messages.MessageCreateParams, 'messages'>>,
  ) {
    this.client = new Anthropic();
    this.params = params;
  }

  async predict(messages: BaseMessage[]) {
    const response = (await this.client.messages.create({
      ...this.params,
      messages,
    } as Anthropic.Messages.MessageCreateParams)) as Anthropic.Message & {
      content: Array<{ text: string }>;
    };

    return {
      content: response.content[0].text,
      raw: response,
    };
  }
}
