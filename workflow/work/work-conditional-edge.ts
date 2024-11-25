import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';

export class WorkConditionalEdge {
  constructor(
    public name: string,
    private fn: (...args: any[]) => Promise<any>,
    public possibleNextNodes: string[],
  ) {}

  @traceflow.trace({ tier: WorkTier.CONDITIONAL_EDGE })
  async predict(...args: any[]): Promise<any> {
    return this.fn(...args);
  }
}
