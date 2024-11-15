import { Ollama } from 'flow/custom-provider/ollama-provider';
import type {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
} from 'openai/resources/chat/completions';
import type { ChatClient } from 'flow/chat-client/chat-client.interface';
import type { BaseMessage } from 'flow/message/base-message.interface';
import type { NormalizedCompletion } from './normalized-completion.interface';
import { AssistantMessage } from 'flow/message/assistant-message';

type OllamaParams = Partial<
  Omit<Omit<ChatCompletionCreateParamsBase, 'model'>, 'messages'> & {
    model: string;
  }
>;

export class ChatOllama implements ChatClient {
  private client: Ollama;
  private readonly params: OllamaParams;

  constructor(params: OllamaParams) {
    this.client = new Ollama();
    this.params = params;
  }

  async predict(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<ChatCompletion>> {
    const response = (await this.client.chat.completions.create({
      ...this.params,
      messages,
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
      raw: response,
    };

    return new AssistantMessage({ content: metadata.text, metadata });
  }
}
