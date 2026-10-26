export interface EmailGlobalSettings {
  textColor: string;
  textAlign: "left" | "center" | "right" | "justify";
  backgroundColor: string;
  contentWidth: number;
  contentAlign: "left" | "center" | "right";
  fontFamily: string;
  fontWeight: "normal" | "bold";
  contentBackgroundColor: string;
  contentPadding: string;
  outerPadding: string;
  blockGap: string;
  defaultFontSize: string;
  defaultLineHeight: string;
  paragraphSpacing: string;
  listSpacing: string;
  listIndent: string;
  linkColor: string;
  linkDecoration: "underline" | "none";
  borderWidth: string;
  borderStyle: "solid" | "dashed" | "dotted" | "none";
  borderColor: string;
  borderRadius: string;
}

export interface EmailDocument {
  version: 1;
  subject?: string;
  global: EmailGlobalSettings;
  blocks: EmailBlockNode[];
}

export interface EmailBlockNode {
  id: string;
  type: string;
  fields: Record<string, unknown>;
  style?: EmailBlockStyle;
  defaultData?: Record<string, unknown>;
}

export interface EmailDecorationStyle {
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
}

export interface EmailTypographyStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  paragraphSpacing?: string;
  listSpacing?: string;
  listIndent?: string;
  linkColor?: string;
  linkDecoration?: "underline" | "none";
}

/** 按钮、图片和分割线自身的样式，与区块容器样式独立。 */
export interface EmailElementStyle extends EmailDecorationStyle, EmailTypographyStyle {
  padding?: string;
  width?: string;
  height?: string;
  align?: "left" | "center" | "right";
}

export interface EmailSpacingStyle {
  padding?: string;
  margin?: string;
}

export interface EmailBlockStyle {
  dimension?: EmailSpacingStyle;
  typography?: EmailTypographyStyle;
  decorations?: EmailDecorationStyle;
  element?: EmailElementStyle;
}
