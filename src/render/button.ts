import type { CSSProperties } from "react";
import { BUTTON_BOX_DEFAULTS } from "../blocks/element-controls";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";
import { cssColor, cssLength, cssSpacing } from "../utils/css-values";
import { radiusStyle, typographyStyle } from "../utils/style";

/** 按钮文案只有 controls.html 一个来源。 */
export function buttonContent(block: EmailBlockNode): string {
  return String(block.controls.html ?? "");
}

export function buttonStyles(block: EmailBlockNode, body?: EmailBodySettings) {
  const element = { ...BUTTON_BOX_DEFAULTS, ...block.style?.element };
  const text: CSSProperties = { ...typographyStyle(undefined, body), textAlign: "center" };
  const box: CSSProperties = {
    backgroundColor: cssColor(element.backgroundColor, BUTTON_BOX_DEFAULTS.backgroundColor),
    ...radiusStyle(element.borderRadius),
    padding: cssSpacing(element.padding, BUTTON_BOX_DEFAULTS.padding), textAlign: "center",
  };
  return { element, width: cssLength(element.width, "auto", true), text, box };
}
