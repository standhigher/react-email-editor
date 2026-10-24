import type { ReactNode } from "react";
import type { EmailBlockNode, EmailBlockStyle } from "./document";

export type FieldType =
  | "text"
  | "textarea"
  | "html"
  | "url"
  | "number"
  | "color"
  | "select";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  defaultValue?: unknown;
  placeholder?: string;
  options?: FieldOption[];
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
  /** e.g. "typography.fontSize" — which style slot this reads and writes */
  id: string;
  group: StyleGroup;
  label: string;
  control: StyleControlType;
  options?: FieldOption[];
  /** Unit suffix for number/range controls, e.g. "px". Omit for unitless values. */
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export type RenderMode = "canvas" | "email";

export interface BlockRenderContext {
  block: EmailBlockNode;
  fields: Record<string, unknown>;
  style: EmailBlockStyle;
  /** canvas = static demo; email = may contain Go template directives. */
  mode: RenderMode;
}

export interface BlockDefinition {
  type: string;
  title: string;
  icon?: ReactNode | string;
  description?: string;
  fields?: FieldConfig[];
  styleFields?: StyleFieldConfig[];
  defaultFields?: Record<string, unknown>;
  defaultStyle?: EmailBlockStyle;
  /** Sample data used only to render template HTML on the canvas. */
  defaultData?: Record<string, unknown>;
  /** Content is edited inline on the canvas and stored in fields.html. */
  inlineEdit?: boolean;
  render: (ctx: BlockRenderContext) => string;
}

export interface Variable {
  name: string;
  label: string;
  description?: string;
}
