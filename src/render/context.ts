import { DEFAULT_EMAIL_GLOBAL } from "../document/constants";
import { getBlockDefinition } from "../document/registry";
import { resolveBlockStyle } from "../document/block-style";
import type { BlockDefinition, BlockRenderContext, RenderMode } from "../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../types/document";

export function buildRenderContext(
  node: EmailBlockNode,
  mode: RenderMode,
  global: EmailGlobalSettings = DEFAULT_EMAIL_GLOBAL,
  definition: BlockDefinition | undefined = getBlockDefinition(node.type),
): BlockRenderContext {
  const block = { ...node, style: resolveBlockStyle(node.style, definition) };
  return {
    block,
    fields: node.fields ?? {},
    style: block.style,
    mode,
    global,
  };
}
