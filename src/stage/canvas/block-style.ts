import type { CSSProperties } from "react";
import type { EmailBlockNode } from "../../types/document";

export function canvasBlockStyle(
  block: EmailBlockNode,
  inlineEdit: boolean | undefined,
): CSSProperties {
  const style: CSSProperties = {
    padding: block.style?.dimension?.padding ?? "0",
    backgroundColor: block.style?.decorations?.backgroundColor ?? "transparent",
  };

  if (!inlineEdit) return style;

  const typography = block.style?.typography ?? {};
  style.fontFamily = "Arial, Helvetica, sans-serif";
  if (typography.fontSize) style.fontSize = typography.fontSize;
  if (typography.fontWeight) style.fontWeight = typography.fontWeight;
  if (typography.lineHeight) style.lineHeight = typography.lineHeight;
  if (typography.color) style.color = typography.color;
  if (typography.textAlign) style.textAlign = typography.textAlign;
  return style;
}
