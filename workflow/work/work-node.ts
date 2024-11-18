import { traceflow } from 'traceflow/core/traceflow';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';

export class WorkNode {
  constructor(
    private name: string,
    private fn: (...args: any[]) => Promise<any>,
  ) {}

  @traceflow.trace({ tier: WorkTier.NODE })
  async predict(...args: any[]): Promise<any> {
    return this.fn(...args);
  }
}
