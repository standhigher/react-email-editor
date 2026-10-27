import { getBlockDefinition } from "./registry";
import { generateId } from "../utils/id";
import type { BlockDefinition } from "../types/block";
import type { EmailBlockNode } from "../types/document";

export function createBlockNode(
  type: string,
  definitions?: BlockDefinition[],
): EmailBlockNode | null {
  const definition = getBlockDefinition(type, definitions);
  if (!definition) return null;

  const fields: Record<string, unknown> = { ...definition.defaultFields };
  for (const field of definition.fields ?? []) {
    if (!(field.name in fields) && field.defaultValue !== undefined) {
      fields[field.name] = field.defaultValue;
    }
  }
  if (definition.inlineEdit && !("html" in fields)) {
    fields.html = "<p></p>";
  }

  return {
    id: generateId(type),
    type,
    fields,
    style: definition.defaultStyle
      ? structuredClone(definition.defaultStyle)
      : undefined,
    defaultData: definition.defaultData
      ? structuredClone(definition.defaultData)
      : undefined,
  };
}
