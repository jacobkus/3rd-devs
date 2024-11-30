import type { BaseMessage } from 'flow/message/base-message.interface';
import type { AssistantMessage } from 'flow/message/assistant-message';
import { WorkUnit } from 'flow/work/work-unit';

export class ClientChat<RawResponse> extends WorkUnit {
  async invoke(
    messages: BaseMessage[],
  ): Promise<AssistantMessage<RawResponse>> {
    throw new Error('Method not implemented.');
  }
}
