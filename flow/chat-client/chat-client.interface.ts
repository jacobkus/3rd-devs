import type { BaseMessage } from 'flow/message/base-message.interface';
import type { NormalizedCompletion } from 'flow/chat-client/normalized-completion.interface';

export interface ChatClient {
  predict(messages: BaseMessage[]): Promise<NormalizedCompletion>;
}
