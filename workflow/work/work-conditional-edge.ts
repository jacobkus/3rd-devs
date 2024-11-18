import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';

export class WorkConditionalEdge {
  constructor(
    private name: string,
    private fn: (...args: any[]) => Promise<any>,
  ) {}

  @traceflow.trace({ tier: WorkTier.CONDITIONAL_EDGE })
  async predict(...args: any[]): Promise<any> {
    return this.fn(...args);
  }
}
