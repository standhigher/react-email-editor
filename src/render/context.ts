import { DEFAULT_EMAIL_GLOBAL } from "../document/constants";
import type { BlockRenderContext, RenderMode } from "../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../types/document";

export function buildRenderContext(
  node: EmailBlockNode,
  mode: RenderMode,
  global: EmailGlobalSettings = DEFAULT_EMAIL_GLOBAL,
): BlockRenderContext {
  return {
    block: node,
    fields: node.fields ?? {},
    style: node.style ?? {},
    mode,
    global,
  };
}
