export type StringReducer = (value1: string, value2: string) => string;

export type ArrayReducer<T> = (value1: T[], value2: T[]) => T[];
