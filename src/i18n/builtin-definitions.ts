import { DEFAULT_BLOCKS } from "../blocks/registry";
import type { BlockDefinition } from "../types/block";

const ownedDefinitions = new WeakSet<BlockDefinition>(DEFAULT_BLOCKS);

export function registerBuiltinMetadata(definition: BlockDefinition): void {
  ownedDefinitions.add(definition);
}

export function hasBuiltinMetadata(definition: BlockDefinition): boolean {
  return ownedDefinitions.has(definition);
}
