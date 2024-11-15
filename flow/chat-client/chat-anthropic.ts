import Anthropic from '@anthropic-ai/sdk';
import type { BaseMessage } from 'flow/message/base-message.interface';
import type { ChatClient } from 'flow/chat-client/chat-client.interface.ts';
import type { NormalizedCompletion } from 'flow/chat-client/normalized-completion.interface';
import { AssistantMessage } from 'flow/message/assistant-message';

type AnthropicResponseMessage = Anthropic.Message & {
  content: Array<{ text: string }>;
};

export class ChatAnthropic implements ChatClient {
  private client: Anthropic;
  private readonly params: Omit<
    Anthropic.Messages.MessageCreateParams,
    'messages'
  >;

  constructor(
    params: Omit<Anthropic.Messages.MessageCreateParams, 'messages'> & {
      max_tokens: number;
    },
  ) {
    this.client = new Anthropic();
    this.params = params;
  }

  async predict(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<AnthropicResponseMessage>> {
    const response = (await this.client.messages.create({
      ...this.params,
      messages,
    } as Anthropic.Messages.MessageCreateParams)) as AnthropicResponseMessage;

    const metadata: NormalizedCompletion<AnthropicResponseMessage> = {
      id: response.id,
      text: response.content[0].text,
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        totalTokens:
          (response.usage?.input_tokens ?? 0) +
          (response.usage?.output_tokens ?? 0),
      },
      metadata: {
        model: response.model,
        role: response.role,
        type: response.type,
      },
      raw: response,
    };

    return new AssistantMessage({ content: metadata.text, metadata });
  }
}
