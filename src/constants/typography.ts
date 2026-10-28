import { FONT_WEIGHTS, LINK_DECORATIONS, TEXT_ALIGNS } from "./style-values";
import type { EmailTypographyStyle } from "../types/document";

/** 内部基础排版。文字的显式格式由 controls.html 或自定义区块的 typography 覆盖。 */
export const DEFAULT_TYPOGRAPHY: Readonly<Required<EmailTypographyStyle>> = Object.freeze({
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: FONT_WEIGHTS.normal,
  lineHeight: "1.5",
  color: "#000000",
  textAlign: TEXT_ALIGNS.left,
  paragraphSpacing: "6px",
  listSpacing: "4px",
  listIndent: "22px",
  linkColor: "#005bd3",
  linkDecoration: LINK_DECORATIONS.underline,
});
