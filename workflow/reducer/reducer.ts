export function reducer<T extends string | any[]>(value1: T, value2: T): T {
  return Array.isArray(value1) && Array.isArray(value2)
    ? ([...value1, ...value2] as T)
    : (((value1 as string) + value2) as string as T);
}
