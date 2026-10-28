import { isValidElement } from "react";

/** 复制并冻结声明元数据；函数和 React 元素保留身份，不递归冻结消费方对象。 */
export function snapshotConfig<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map((item: unknown) => snapshotConfig(item))) as T;
  if (!value || typeof value !== "object" || isValidElement(value)) return value;
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return value;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshotConfig(item)]))) as T;
}
