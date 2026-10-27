import type { Mark } from "@tiptap/pm/model";
import type { FontWeight, TextAlign } from "../../constants/style-values";

export interface EditorTextRange {
  anchor: number;
  head: number;
  storedMarks: readonly Mark[] | null;
}

export type RichTextMenu = "font" | "size" | "emoji" | "color" | "link" | "variable" | "spacing" | "lineHeight" | "list";

export type TextAlignment = TextAlign;

export interface RichTextInheritedStyle {
  fontFamily: string;
  fontSize: string;
  color: string;
  fontWeight: FontWeight;
  lineHeight: string;
  paragraphSpacing: string;
  listSpacing?: string;
  listIndent?: string;
  linkColor?: string;
  linkDecoration?: string;
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
  linkColor: string;
  linkDecoration: string;
  listSpacing: string;
  listIndent: string;
  spacing: string;
  lineHeight: string;
}
