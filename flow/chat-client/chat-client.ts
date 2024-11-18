import type { BaseMessage } from 'flow/message/base-message.interface';
import type { AssistantMessage } from 'flow/message/assistant-message';
import { WorkUnit } from 'flow/work/work-unit';

export class ChatClient<RawResponse> extends WorkUnit {
  async predict(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<RawResponse>> {
    throw new Error('Method not implemented.');
  }
}
