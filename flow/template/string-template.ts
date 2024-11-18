import { UserMessage } from 'flow/message/user-message';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { WorkUnit } from 'flow/work/work-unit';
import { traceflow } from 'traceflow/core/traceflow';

export class StringTemplate extends WorkUnit {
  @traceflow.trace({ name: 'StringTemplate', tier: WorkTier.UNIT })
  async predict(string: string): Promise<UserMessage[]> {
    return [new UserMessage({ content: string })];
  }
}
