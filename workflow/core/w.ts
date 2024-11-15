import { BaseArray } from 'workflow/base/base-array';
import { BaseString } from 'workflow/base/base-string';
import type {
  ArrayReducer,
  StringReducer,
} from 'workflow/reducer/reducer.types';

export const w = {
  string: (reducer?: StringReducer): string =>
    new BaseString('', reducer) as unknown as string,
  array: <T>(reducer?: ArrayReducer<T>): T[] =>
    new BaseArray([], reducer) as unknown as T[],
};
