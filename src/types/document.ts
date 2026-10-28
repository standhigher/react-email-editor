import type { BorderStyle, FontWeight, HorizontalAlign, LinkDecoration, TextAlign } from "../constants/style-values";
import { DOCUMENT_VERSION } from "../document/constants";

/** 邮件主体布局、外观和可继承的基础文字与链接样式。 */
export interface EmailBodySettings {
  textColor: string;
  backgroundColor: string;
  contentWidth: number;
  fontFamily: string;
  fontWeight: FontWeight;
  linkColor: string;
  linkDecoration: LinkDecoration;
  contentPadding: string;
  blockGap: string;
  borderWidth: string;
  borderStyle: BorderStyle;
  borderColor: string;
}

export interface EmailDocument {
  version: typeof DOCUMENT_VERSION;
  subject?: string;
  body: EmailBodySettings;
  blocks: EmailBlockNode[];
}

export interface EmailBlockNode {
  id: string;
  type: string;
  controls: Record<string, unknown>;
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
  /** 自定义区块可通过 styleControls 启用；内置区块不支持。只使用 px。 */
  height?: string;
}

export interface EmailBlockStyle {
  dimension?: EmailSpacingStyle;
  /** 自定义区块可显式启用；内置区块的文字格式存于 controls.html。 */
  typography?: EmailTypographyStyle;
  decorations?: EmailDecorationStyle;
  element?: EmailElementStyle;
}
