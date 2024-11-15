import type { StringReducer } from 'workflow/reducer/reducer.types';

export class BaseString {
  constructor(
    public value: string,
    public fn?: StringReducer,
  ) {}
}
