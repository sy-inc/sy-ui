export type Dict<T = any> = Record<string, T>;

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export function isObject(value: any): value is Dict {
  const type = typeof value;

  return value != null && (type === "object" || type === "function") && !isArray(value);
}

export function isEmpty(value: any): boolean {
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;

  return value == null || value === "";
}

export type Booleanish = boolean | "true" | "false";

export const dataAttr = (condition: boolean | undefined) =>
  (condition ? "true" : undefined) as Booleanish;
