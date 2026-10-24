import type { BlockRenderContext, RenderMode } from "../types/block";
import type { EmailBlockNode } from "../types/document";

export function buildRenderContext(
  node: EmailBlockNode,
  mode: RenderMode,
): BlockRenderContext {
  return {
    block: node,
    fields: node.fields ?? {},
    style: node.style ?? {},
    mode,
  };
}
