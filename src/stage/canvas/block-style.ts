import type { CSSProperties } from "react";
import { blockContentStyle } from "../../utils/style";
import { contentVariables } from "../../render/content-style";
import type { EmailBlockNode, EmailGlobalSettings } from "../../types/document";

export function canvasBlockStyle(block: EmailBlockNode, global: EmailGlobalSettings): CSSProperties {
  return { ...blockContentStyle(block.style, global), ...contentVariables(block.style, global) };
}
