/**
 * Core data model for the email template editor.
 *
 * Three layers:
 * - EmailDocument    the whole document (single source of truth)
 * - EmailBlockNode   one block instance inside a document
 * - BlockDefinition  the block "schema", deciding which inspector controls to show
 *                    and how to render HTML
 */

import type { ReactNode } from "react";

export interface EmailDocument {
  version: 1;
  subject?: string;
  blocks: EmailBlockNode[];
}

export interface EmailBlockNode {
  id: string;
  type: string;
  fields: Record<string, unknown>;
  style?: EmailBlockStyle;
}

export interface EmailBlockStyle {
  dimension?: {
    padding?: string;
  };
  typography?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    textAlign?: "left" | "center" | "right";
  };
  decorations?: {
    backgroundColor?: string;
    borderRadius?: string;
  };
}

export interface Variable {
  name: string;
  label: string;
  description?: string;
}

// ---------- Block definition ----------

export type FieldType =
  | "text"
  | "textarea"
  | "html"
  | "url"
  | "number"
  | "color"
  | "select";

export interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  defaultValue?: unknown;
  placeholder?: string;
  options?: { label: string; value: string }[];
  rows?: number;
}

export type StyleGroup = "dimension" | "typography" | "decorations";

export type StyleControlType =
  | "text"
  | "color"
  | "alignment"
  | "select"
  | "number"
  | "range";

export interface StyleFieldConfig {
  /** e.g. "typography.fontSize" — which style slot this reads/writes */
  id: string;
  group: StyleGroup;
  label: string;
  control: StyleControlType;
  options?: { label: string; value: string }[];
  /** Unit suffix for number/range controls, e.g. "px". Omit for unitless (line-height). */
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

/** Render context: the same data rendered in "canvas" (static demo) or "email" (Go template) mode. */
export interface BlockRenderContext {
  block: EmailBlockNode;
  fields: Record<string, unknown>;
  style: EmailBlockStyle;
  /** canvas = static demo; email = may contain Go directives (control structures only in email branch). */
  mode: "canvas" | "email";
}

export interface BlockDefinition {
  type: string;
  title: string;
  /** SVG string or React node */
  icon?: ReactNode | string;
  description?: string;
  /** Inspector "content" fields */
  fields?: FieldConfig[];
  /** Inspector "style" fields */
  styleFields?: StyleFieldConfig[];
  defaultFields?: Record<string, unknown>;
  defaultStyle?: EmailBlockStyle;
  /** Whether this block is inline-edited in the canvas (content lives in fields.html) */
  inlineEdit?: boolean;
  /** Outputs the HTML fragment (email mode may contain Go directives) */
  render: (ctx: BlockRenderContext) => string;
}

export const STYLE_GROUPS: { group: StyleGroup; label: string }[] = [
  { group: "dimension", label: "Spacing" },
  { group: "typography", label: "Typography" },
  { group: "decorations", label: "Decorations" },
];
