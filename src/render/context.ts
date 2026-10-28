import { DEFAULT_EMAIL_BODY } from "../document/constants";
import { getBlockDefinition } from "../document/registry";
import { resolveBlockStyle } from "../document/block-style";
import type { BlockDefinition, BlockRenderContext, RenderMode } from "../types/block";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";

export function buildRenderContext(
  node: EmailBlockNode,
  mode: RenderMode,
  body: EmailBodySettings = DEFAULT_EMAIL_BODY,
  definition: BlockDefinition | undefined = getBlockDefinition(node.type),
): BlockRenderContext {
  const snapshot = structuredClone(node);
  const block = { ...snapshot, controls: definition?.readControls(snapshot.controls ?? {}) ?? snapshot.controls ?? {}, style: resolveBlockStyle(snapshot.style, definition) };
  return {
    block,
    controls: block.controls,
    style: block.style,
    mode,
    body: { ...body },
  };
}
