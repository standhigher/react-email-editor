import type { BlockDefinition } from "../types/block";
import type { EmailBlockStyle } from "../types/document";
import { readStyleValue, writeStyleValue } from "../utils/style";

/** 配置能力同时约束画布和邮件渲染；未声明的字段不参与输出。 */
export function resolveBlockStyle(style: EmailBlockStyle | undefined, definition: BlockDefinition | undefined): EmailBlockStyle {
  let result: EmailBlockStyle = {};
  if (!definition) return result;
  for (const control of definition.styleControls ?? []) {
    const value = readStyleValue(style, control.id);
    if (value) result = writeStyleValue(result, control.id, value);
  }
  return result;
}
