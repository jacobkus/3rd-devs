import type { AssistantMessage } from 'flow/message/assistant-message';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { WorkUnit } from 'flow/work/work-unit';
import { traceflow } from 'traceflow/core/traceflow';

export class JsonOutputParser extends WorkUnit {
  @traceflow.trace({ name: 'JsonOutputParser', tier: WorkTier.UNIT })
  async predict<T>(assistantMessage: AssistantMessage<T>): Promise<T> {
    try {
      return JSON.parse(assistantMessage.content);
    } catch (error) {
      throw new Error('Failed to parse JSON output');
    }
  }
}
