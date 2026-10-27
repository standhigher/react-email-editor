import type { FontWeight, TextAlign } from "../../constants/style-values";

export interface EditorTextRange {
  from: number;
  to: number;
}

export type RichTextMenu = "font" | "size" | "emoji" | "color" | "link" | "variable" | "spacing" | "lineHeight";

export type TextAlignment = TextAlign;

export interface RichTextInheritedStyle {
  fontFamily: string;
  fontSize: string;
  color: string;
  fontWeight: FontWeight;
  lineHeight: string;
  paragraphSpacing: string;
}

export interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  bulletList: boolean;
  orderedList: boolean;
  align: TextAlignment | "";
  fontFamily: string;
  fontSize: string;
  fontWeight: FontWeight | "";
  color: string;
  linkHref: string;
  spacing: string;
  lineHeight: string;
}
