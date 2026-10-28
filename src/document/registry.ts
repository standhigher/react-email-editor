import { DEFAULT_BLOCKS } from "../blocks/registry";
import type { BlockDefinition } from "../types/block";

export function getBlockDefinition(
  type: string,
  definitions: readonly BlockDefinition[] = DEFAULT_BLOCKS,
): BlockDefinition | undefined {
  return definitions.find((item) => item.type === type);
}
