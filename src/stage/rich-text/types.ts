import type { Mark } from "@tiptap/pm/model";
import type { FontWeight, TextAlign } from "../../constants/style-values";

export interface EditorTextRange {
  anchor: number;
  head: number;
  storedMarks: readonly Mark[] | null;
}

export type RichTextMenu = "font" | "size" | "emoji" | "link" | "variable" | "spacing" | "lineHeight" | "list";

export type TextAlignment = TextAlign;

/** Inherited styles for the low-level rich-text toolbar. */
export interface RichTextInheritedStyle {
  /** Inherited font stack. */
  fontFamily: string;
  /** Inherited font size. */
  fontSize: string;
  /** Inherited text color. */
  color: string;
  /** Inherited font weight. */
  fontWeight: FontWeight;
  /** Inherited line height. */
  lineHeight: string;
  /** Inherited paragraph spacing. */
  paragraphSpacing: string;
  /** Inherited list item spacing. */
  listSpacing?: string;
  /** Inherited list indentation. */
  listIndent?: string;
  /** Inherited link color. */
  linkColor?: string;
  /** Inherited link decoration. */
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
  linkTarget: string;
  linkColor: string;
  linkDecoration: string;
  listSpacing: string;
  listIndent: string;
  spacing: string;
  lineHeight: string;
}
