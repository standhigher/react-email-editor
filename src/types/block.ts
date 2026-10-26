import type { ReactNode } from "react";
import type { EmailBlockNode, EmailBlockStyle, EmailGlobalSettings } from "./document";

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
  min?: number;
  max?: number;
  step?: number;
}

export type StyleGroup = "general" | "dimension" | "typography" | "decorations";

export type StyleControlType =
  | "text"
  | "color"
  | "alignment"
  | "select"
  | "number"
  | "range"
  | "spacing";

export interface StyleFieldConfig {
  /** e.g. "typography.fontSize" — which style slot this reads and writes */
  id: string;
  group: StyleGroup;
  label: string;
  control: StyleControlType;
  options?: FieldOption[];
  /** Unit suffix for a single-unit slider, e.g. "px". Omit for unitless values. */
  unit?: string;
  /** Email-safe units. A select appears only when more than one is listed. */
  units?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string;
  placeholder?: string;
}

export type RenderMode = "canvas" | "email";

export interface BlockRenderContext {
  block: EmailBlockNode;
  fields: Record<string, unknown>;
  style: EmailBlockStyle;
  /** canvas/email identify the consumer; HTML template resolution is applied by the shared renderer. */
  mode: RenderMode;
  global: EmailGlobalSettings;
}

export interface BlockDefinition {
  type: string;
  title: string;
  icon?: ReactNode | string;
  description?: string;
  fields?: FieldConfig[];
  styleFields?: StyleFieldConfig[];
  /** getBlockDefinition 只保留 styleFields，不补容器间距和装饰。 */
  exactStyleFields?: boolean;
  defaultFields?: Record<string, unknown>;
  defaultStyle?: EmailBlockStyle;
  /** Sample data used to render template HTML in the editor and preview. */
  defaultData?: Record<string, unknown>;
  /** Content is edited inline on the canvas and stored in fields.html. */
  inlineEdit?: boolean;
  render: (ctx: BlockRenderContext) => string;
}

export interface Variable {
  name: string;
  label: string;
  description?: string;
  /** Global sample value used when rendering HTML block templates. */
  value?: unknown;
}
