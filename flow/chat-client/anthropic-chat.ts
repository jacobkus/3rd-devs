import Anthropic from '@anthropic-ai/sdk';
import type { BaseMessage } from 'flow/message/base-message.interface';
import { ClientChat } from 'flow/chat-client/client-chat.ts';
import type { NormalizedCompletion } from 'flow/chat-client/normalized-completion.interface';
import { AssistantMessage } from 'flow/message/assistant-message';
import { traceflow } from 'traceflow/core/traceflow';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';

type AnthropicResponseMessage = Anthropic.Message & {
  content: Array<{ text: string }>;
};

export class AnthropicChat extends ClientChat<AnthropicResponseMessage> {
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
    super();
    this.client = new Anthropic();
    this.params = params;
  }

  @traceflow.trace({
    name: 'AnthropicChat',
    tier: WorkTier.UNIT,
    type: WorkType.GENERATION,
  })
  async invoke(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<AnthropicResponseMessage>> {
    const response = (await this.client.messages.create({
      ...this.params,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
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
    };

    return new AssistantMessage({ content: metadata.text, metadata });
  }
}
