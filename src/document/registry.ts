import { DEFAULT_BLOCKS } from "../blocks/registry";
import type { BlockDefinition } from "../types/block";

export function mergeBlockDefinitions(
  custom: BlockDefinition[] = [],
): BlockDefinition[] {
  const map = new Map<string, BlockDefinition>();
  for (const definition of DEFAULT_BLOCKS) map.set(definition.type, definition);
  for (const definition of custom) map.set(definition.type, definition);
  return Array.from(map.values());
}

export function getBlockDefinition(
  type: string,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
): BlockDefinition | undefined {
  return definitions.find((definition) => definition.type === type);
}
