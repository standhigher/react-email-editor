import type { BlockDefinition } from "../types/block";
import type { EmailBlockStyle } from "../types/document";
import { resolveBlockStyleFields } from "../blocks/style-fields";
import { readStyleValue, writeStyleValue } from "../utils/style";

/** 配置能力同时约束画布和邮件渲染；未声明的字段不参与输出。 */
export function resolveBlockStyle(style: EmailBlockStyle | undefined, definition: BlockDefinition | undefined): EmailBlockStyle {
  let result: EmailBlockStyle = {};
  if (!definition) return result;
  for (const field of resolveBlockStyleFields(definition.styleFields, definition.exactStyleFields)) {
    const value = readStyleValue(style, field.id);
    if (value) result = writeStyleValue(result, field.id, value);
  }
  return result;
}
