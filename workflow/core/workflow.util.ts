import type { BaseState } from 'workflow/base/base-state';

export class WorkflowUtil {
  public wrapStateWithProxy(State: new () => BaseState) {
    return new Proxy(new State(), {
      get: (target: any, prop: string) => {
        return target[prop]?.value;
      },
      set: (target: any, prop: string, newValue: any) => {
        target[prop].value =
          target[prop].fn?.(target[prop].value, newValue) ?? newValue;
        return true;
      },
    });
  }
}
