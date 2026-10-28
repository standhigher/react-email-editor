import type { ComponentType, ReactNode } from "react";
import type { ControlDefinition, PluginEditorProps } from "../plugins/types";
import type { EmailBlockNode, EmailBlockStyle, EmailBodySettings } from "./document";

export interface ControlOption {
  label: string;
  value: string;
}

export interface ControlConfig extends ControlDefinition {
  name: string;
}

export type StyleGroup = "general" | "dimension" | "typography" | "decorations";

export type StyleControlType =
  | "text"
  | "color"
  | "alignment"
  | "select"
  | "number"
  | "range"
  | "spacing"
  | "corners";

export interface StyleControlConfig {
  /** e.g. "typography.fontSize" — which style slot this reads and writes */
  id: string;
  group: StyleGroup;
  label: string;
  control: StyleControlType;
  options?: ControlOption[];
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
  controls: Record<string, unknown>;
  style: EmailBlockStyle;
  /** canvas/email identify the consumer; HTML template resolution is applied by the shared renderer. */
  mode: RenderMode;
  body: EmailBodySettings;
}

export type RichTextProfile = "text" | "heading" | "button";

/** 显式控制检查器的分组及字段归属，分组按声明顺序展示。 */
export interface BlockInspectorSection {
  title: string;
  controlNames?: string[];
  styleIds?: string[];
  advancedStyleIds?: string[];
}

export interface BlockDefinition {
  type: string;
  title: string;
  icon?: ReactNode | string;
  description?: string;
  controls?: ControlConfig[];
  styleControls?: StyleControlConfig[];
  inspectorSections?: BlockInspectorSection[];
  readControls: (value: Record<string, unknown>) => Record<string, unknown>;
  override?: boolean;
  defaultStyle?: EmailBlockStyle;
  /** Sample data used to render template HTML in the editor and preview. */
  defaultData?: Record<string, unknown>;
  /** 默认画布直接编辑的 richText 字段；由字段声明解析生成。 */
  inlineControl?: string;
  /** Optional React inspector for controls that need domain-specific editing UI. */
  inspector?: ComponentType<PluginEditorProps>;
  /** Optional React canvas for multi-region or interactive editing. */
  canvas?: ComponentType<PluginEditorProps>;
  renderEmail: (ctx: BlockRenderContext) => string;
}

export interface Variable {
  /** 下拉展示并插入的变量，例如 `{{  store_name }}`。 */
  name: string;
  /** 下拉选项副文案。空字符串或不传时不渲染。 */
  description?: string;
  /** 预览时替换该变量的文本。 */
  value?: string;
}
