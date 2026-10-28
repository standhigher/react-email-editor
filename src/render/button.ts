import type { CSSProperties } from "react";
import { BUTTON_BOX_DEFAULTS } from "../blocks/element-fields";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";
import { cssLength, cssSpacing } from "../utils/css-values";
import { decorationStyle, typographyStyle } from "../utils/style";

/** 按钮文案只有 fields.html 一个来源。 */
export function buttonContent(block: EmailBlockNode): string {
  return String(block.fields.html ?? "");
}

export function buttonStyles(block: EmailBlockNode, body?: EmailBodySettings) {
  const element = { ...BUTTON_BOX_DEFAULTS, ...block.style?.element };
  const text: CSSProperties = { ...typographyStyle(undefined, body), textAlign: "center" };
  const box: CSSProperties = {
    ...decorationStyle(element), padding: cssSpacing(element.padding, BUTTON_BOX_DEFAULTS.padding), textAlign: "center",
  };
  return { element, width: cssLength(element.width, "auto", true), text, box };
}
