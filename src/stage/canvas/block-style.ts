import type { CSSProperties } from "react";
import { resolvedFontWeight } from "../../utils/style";
import type { EmailBlockNode, EmailGlobalSettings } from "../../types/document";

export function canvasBlockStyle(
  block: EmailBlockNode,
  inlineEdit: boolean | undefined,
  global: EmailGlobalSettings,
): CSSProperties {
  const style: CSSProperties = {
    padding: block.style?.dimension?.padding ?? "0",
    backgroundColor: block.style?.decorations?.backgroundColor ?? "transparent",
    color: global.textColor,
    fontFamily: global.fontFamily,
  };

  if (!inlineEdit) return style;

  const typography = block.style?.typography ?? {};
  style.fontWeight = resolvedFontWeight(typography.fontWeight, global.fontWeight);
  if (typography.fontSize) style.fontSize = typography.fontSize;
  if (typography.lineHeight) style.lineHeight = typography.lineHeight;
  if (typography.color) style.color = typography.color;
  if (typography.textAlign) style.textAlign = typography.textAlign;
  return style;
}
