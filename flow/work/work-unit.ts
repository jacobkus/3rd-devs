import { WorkLine } from 'flow/work/work-line';

export class WorkUnit {
  public async invoke(...args: any[]): Promise<any> {}

  public line(other: WorkUnit | WorkLine) {
    return new WorkLine([this, other]);
  }
}
