import { Ollama } from 'flow/custom-provider/ollama-provider';
import type {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
} from 'openai/resources/chat/completions';
import type { ChatClient } from 'flow/chat-client/chat-client.interface';
import type { BaseMessage } from 'flow/message/base-message.interface';

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
