import type { AssistantMessage } from 'flow/message/assistant-message';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { WorkUnit } from 'flow/work/work-unit';
import { traceflow } from 'traceflow/core/traceflow';

export class StringOutputParser extends WorkUnit {
  @traceflow.trace({ name: 'StringOutputParser', tier: WorkTier.UNIT })
  async predict<T>(assistantMessage: AssistantMessage<T>): Promise<string> {
    return assistantMessage.content;
  }
}
