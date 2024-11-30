import type {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
} from 'openai/resources/chat/completions';
import { ClientChat } from 'flow/chat-client/client-chat.ts';
import type { BaseMessage } from 'flow/message/base-message.interface';
import { AssistantMessage } from 'flow/message/assistant-message';
import { traceflow } from 'traceflow/core/traceflow';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import type { NormalizedCompletion } from 'flow/chat-client/normalized-completion.interface';
import { MLX } from 'flow/custom-provider/mlx-provider';

type MLXParams = Partial<
  Omit<Omit<ChatCompletionCreateParamsBase, 'model'>, 'messages'> & {
    model: string;
  }
>;

export class MlxChat extends ClientChat<ChatCompletion> {
  private client: MLX;
  private readonly params: MLXParams;

  constructor(params: MLXParams) {
    super();
    this.client = new MLX();
    this.params = params;
  }

  @traceflow.trace({
    name: 'MlxChat',
    tier: WorkTier.UNIT,
    type: WorkType.GENERATION,
  })
  async invoke(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<ChatCompletion>> {
    const response = (await this.client.chat.completions.create({
      ...this.params,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    } as ChatCompletionCreateParamsBase)) as ChatCompletion;

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
