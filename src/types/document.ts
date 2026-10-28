import type { BorderStyle, FontWeight, HorizontalAlign, LinkDecoration, TextAlign } from "../constants/style-values";
import { DOCUMENT_VERSION } from "../document/constants";

/** Email body layout and inherited defaults. */
export interface EmailBodySettings {
  /** Default text color. */
  textColor: string;
  /** Centered content background; outer area is white. */
  backgroundColor: string;
  /** Maximum content width in px, normalized to an integer from 320 to 900. */
  contentWidth: number;
  /** Default CSS font stack. */
  fontFamily: string;
  /** Default font weight: normal or bold. */
  fontWeight: FontWeight;
  /** Color of links without explicit formatting. */
  linkColor: string;
  /** Default link decoration: underline or none. */
  linkDecoration: LinkDecoration;
  /** CSS padding inside the content border. */
  contentPadding: string;
  /** CSS length between adjacent blocks. */
  blockGap: string;
  /** Content container border width. */
  borderWidth: string;
  /** Content border style. */
  borderStyle: BorderStyle;
  /** Content border color. */
  borderColor: string;
}

/** Persistable email document; only v4 is supported. */
export interface EmailDocument {
  /** Format version; must be DOCUMENT_VERSION (4). */
  version: typeof DOCUMENT_VERSION;
  /** Optional subject, separate from exported HTML content. */
  subject?: string;
  /** Complete body layout and style settings. */
  body: EmailBodySettings;
  /** Blocks in display and export order. */
  blocks: EmailBlockNode[];
}

/** Persisted block node without components or render functions. */
export interface EmailBlockNode {
  /** Unique block identifier within the document. */
  id: string;
  /** Registered plugin type. */
  type: string;
  /** Control values keyed by the plugin schema. */
  controls: Record<string, unknown>;
  /** Enabled block style overrides. */
  style?: EmailBlockStyle;
  /** Block preview data taking precedence over global data in a shallow merge. */
  defaultData?: Record<string, unknown>;
}

/** Container or element appearance. */
export interface EmailDecorationStyle {
  /** Background color. */
  backgroundColor?: string;
  /** CSS border radius. */
  borderRadius?: string;
  /** CSS border width. */
  borderWidth?: string;
  /** Border color. */
  borderColor?: string;
  /** Border line style. */
  borderStyle?: BorderStyle;
}

/** Typography explicitly enabled by custom blocks. */
export interface EmailTypographyStyle {
  /** CSS font stack. */
  fontFamily?: string;
  /** CSS font size. */
  fontSize?: string;
  /** Font weight. */
  fontWeight?: FontWeight;
  /** Line height, including unitless multipliers. */
  lineHeight?: string;
  /** Text color. */
  color?: string;
  /** Horizontal text alignment. */
  textAlign?: TextAlign;
  /** Paragraph spacing. */
  paragraphSpacing?: string;
  /** List item spacing. */
  listSpacing?: string;
  /** List indentation. */
  listIndent?: string;
  /** Default link color. */
  linkColor?: string;
  /** Default link decoration. */
  linkDecoration?: LinkDecoration;
}

/** Button, image or divider styles, including appearance fields. */
export interface EmailElementStyle extends EmailDecorationStyle {
  /** Element CSS padding. */
  padding?: string;
  /** Element CSS width. */
  width?: string;
  /** Element CSS height. */
  height?: string;
  /** Element horizontal alignment within its container. */
  align?: HorizontalAlign;
}

/** Block container dimensions and spacing. */
export interface EmailSpacingStyle {
  /** Container padding. */
  padding?: string;
  /** Container outer spacing. */
  margin?: string;
  /** Fixed height in px for enabled custom blocks; unsupported by builtins. */
  height?: string;
}

/** Grouped styles; only plugin-enabled controls are read. */
export interface EmailBlockStyle {
  /** Container dimensions and spacing. */
  dimension?: EmailSpacingStyle;
  /** Optional custom typography; builtin text formatting lives in controls.html. */
  typography?: EmailTypographyStyle;
  /** Block container appearance. */
  decorations?: EmailDecorationStyle;
  /** Styles of the button, image or other inner element. */
  element?: EmailElementStyle;
}
