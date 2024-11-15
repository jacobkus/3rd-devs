import type { BaseMessage } from 'flow/message/base-message.interface';

export interface ChatClient {
  predict(messages: BaseMessage[]): Promise<{
    content: string;
    raw: unknown;
  }>;
}
