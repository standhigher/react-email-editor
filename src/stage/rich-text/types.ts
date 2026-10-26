export interface EditorTextRange {
  from: number;
  to: number;
}

export type RichTextMenu = "font" | "size" | "emoji" | "color" | "link" | "variable";

export type TextAlignment = "left" | "center" | "right" | "justify";

export interface RichTextInheritedStyle {
  fontFamily: string;
  fontSize: string;
  color: string;
  fontWeight: "normal" | "bold";
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
  fontWeight: "normal" | "bold" | "";
  color: string;
  linkHref: string;
}
