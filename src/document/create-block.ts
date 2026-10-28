import { writeStyleValue } from "../utils/style";
import { getBlockDefinition } from "./registry";
import { generateId } from "../utils/id";
import { resolveBlockStyle } from "./block-style";
import type { BlockDefinition } from "../types/block";
import type { EmailBlockNode } from "../types/document";

export function createBlockNode(
  type: string,
  definitions?: readonly BlockDefinition[],
): EmailBlockNode | null {
  const definition = getBlockDefinition(type, definitions);
  if (!definition) return null;

  const controls = structuredClone(definition.readControls({}));
  let style = resolveBlockStyle(definition.defaultStyle, definition);
  for (const control of definition.styleControls ?? []) {
    const [group, key] = control.id.split(".");
    const stored = definition.defaultStyle?.[group as keyof typeof definition.defaultStyle];
    if (control.defaultValue !== undefined && (!stored || !(key in stored))) style = writeStyleValue(style, control.id, control.defaultValue);
  }

  return {
    id: generateId(type),
    type,
    controls,
    style,
    defaultData: definition.defaultData
      ? structuredClone(definition.defaultData)
      : undefined,
  };
}
