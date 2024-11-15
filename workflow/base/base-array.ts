import type { ArrayReducer } from 'workflow/reducer/reducer.types';

export class BaseArray {
  constructor(
    public value: any[],
    public fn?: ArrayReducer<any>,
  ) {}
}
