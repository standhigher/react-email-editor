import { DEFAULT_BLOCKS } from "../blocks/registry";
import { getBlockDefinition } from "../document/registry";
import { blockCellCss } from "../utils/style";
import { buildRenderContext } from "./context";
import type { BlockDefinition, RenderMode } from "../types/block";
import type { EmailBlockNode } from "../types/document";

export function renderBlock(
  node: EmailBlockNode,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
): string {
  const definition = getBlockDefinition(node.type, definitions);
  return definition
    ? definition.render(buildRenderContext(node, mode))
    : `<!-- unknown block type: ${node.type} -->`;
}

export function blockToHtml(
  node: EmailBlockNode,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
): string {
  const inner = renderBlock(node, definitions, mode);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockCellCss(node.style)}">${inner}</td></tr></table>`;
}
