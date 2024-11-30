import { traceflow } from 'traceflow/core/traceflow';
import { WorkUnit } from 'flow/work/work-unit';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';

export class WorkLine {
  constructor(private children: (WorkUnit | WorkLine)[]) {}

  async invoke(...args: any[]): Promise<any> {
    return await this.loop(...args);
  }

  line(other: WorkUnit | WorkLine) {
    return new WorkLine([...this.children, other]);
  }

  @traceflow.trace({ tier: WorkTier.LINE })
  async loop(...args: any[]) {
    for await (const child of this.children) {
      if (child instanceof WorkUnit) {
        const result = await child.invoke(...args);
        args = [result];
      } else if (child instanceof WorkLine) {
        const result = await child.loop(args);
        args = [result];
      }
    }
    return args[0];
  }
}
