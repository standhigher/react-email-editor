import type { BorderStyle, FontWeight, HorizontalAlign, LinkDecoration, TextAlign } from "../constants/style-values";
import { DOCUMENT_VERSION } from "../document/constants";

export interface EmailGlobalSettings {
  textColor: string;
  textAlign: TextAlign;
  backgroundColor: string;
  contentWidth: number;
  contentAlign: HorizontalAlign;
  fontFamily: string;
  fontWeight: FontWeight;
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
  linkDecoration: LinkDecoration;
  borderWidth: string;
  borderStyle: BorderStyle;
  borderColor: string;
  borderRadius: string;
}

export interface EmailDocument {
  version: typeof DOCUMENT_VERSION;
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
  borderStyle?: BorderStyle;
}

export interface EmailTypographyStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: FontWeight;
  lineHeight?: string;
  color?: string;
  textAlign?: TextAlign;
  paragraphSpacing?: string;
  listSpacing?: string;
  listIndent?: string;
  linkColor?: string;
  linkDecoration?: LinkDecoration;
}

/** 按钮、图片和分割线自身的样式，与区块容器样式独立。 */
export interface EmailElementStyle extends EmailDecorationStyle {
  padding?: string;
  width?: string;
  height?: string;
  align?: HorizontalAlign;
}

export interface EmailSpacingStyle {
  padding?: string;
  margin?: string;
  /** 自定义区块可通过 styleFields 启用；内置区块不支持。只使用 px。 */
  height?: string;
}

export interface EmailBlockStyle {
  dimension?: EmailSpacingStyle;
  /** 自定义区块可显式启用；内置区块的文字格式存于 fields.html。 */
  typography?: EmailTypographyStyle;
  decorations?: EmailDecorationStyle;
  element?: EmailElementStyle;
}
