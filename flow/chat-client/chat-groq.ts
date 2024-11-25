import type { BaseMessage } from 'flow/message/base-message.interface';
import type { NormalizedCompletion } from 'flow/chat-client/normalized-completion.interface';
import { AssistantMessage } from 'flow/message/assistant-message';
import { WorkUnit } from 'flow/work/work-unit';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';
import Groq from 'groq-sdk';
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
} from 'groq-sdk/src/resources/chat/completions.js';

export class ChatGroq extends WorkUnit {
  private client: Groq;
  private readonly params: Omit<ChatCompletionCreateParams, 'messages'>;

  constructor(params: Omit<ChatCompletionCreateParams, 'messages'>) {
    super();
    this.client = new Groq();
    this.params = params;
  }

  @traceflow.trace({
    name: 'ChatGroq',
    tier: WorkTier.UNIT,
    type: WorkType.GENERATION,
  })
  async predict(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<ChatCompletion>> {
    const response = (await this.client.chat.completions.create({
      ...this.params,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    } as ChatCompletionCreateParams)) as ChatCompletion;

    const metadata: NormalizedCompletion<ChatCompletion> = {
      id: response.id,
      text: response.choices[0].message.content ?? '',
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      metadata: {
        model: response.model,
        role: response.choices[0].message.role,
        type: response.object,
      },
    };

    return new AssistantMessage({ content: metadata.text, metadata });
  }
}
