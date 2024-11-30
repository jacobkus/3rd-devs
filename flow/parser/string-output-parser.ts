import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { WorkUnit } from 'flow/work/work-unit';
import { traceflow } from 'traceflow/core/traceflow';
import type { BaseMessage } from 'flow/message/base-message.interface';

export class StringOutputParser extends WorkUnit {
  @traceflow.trace({ name: 'StringOutputParser', tier: WorkTier.UNIT })
  async invoke(assistantMessage: BaseMessage): Promise<string> {
    return assistantMessage.content;
  }
}
