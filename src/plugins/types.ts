import type { ComponentType, ReactNode } from "react";
import type { BlockDefinition, BlockInspectorSection, BlockRenderContext, ControlOption, RichTextProfile, StyleControlConfig, Variable } from "../types/block";
import type { EmailBlockNode, EmailBlockStyle, EmailBodySettings, EmailDocument } from "../types/document";
import type { DocumentHtmlOptions } from "../render/document-html";
import type { EmailMarkup, EmailTools } from "./email-tools";

export type ControlKind = "text" | "textarea" | "html" | "richText" | "url" | "image" | "number" | "color" | "select" | "boolean" | "list" | "custom";

export interface ControlComponentProps<T = unknown> {
  value: T;
  onChange: (value: T) => void;
  label: string;
  body: EmailBodySettings;
  variables: Variable[];
}

export interface ControlOptions<T> {
  label: string;
  defaultValue?: T;
  placeholder?: string;
  options?: ControlOption[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  profile?: RichTextProfile;
  /** 由默认画布直接编辑此字段；多区域布局使用 Canvas + EditableRichText。 */
  inline?: boolean;
  component?: ComponentType<ControlComponentProps<T>>;
  validate?: (value: T) => string | undefined;
}

/** 工厂生成的字段，同时负责默认值、运行时窄化和可选自定义控件。 */
export interface ControlDefinition<T = unknown> extends Omit<ControlOptions<T>, "component" | "validate"> {
  kind: ControlKind;
  defaultValue: T;
  read: (value: unknown) => T;
  /** 只接收已归一化的字段值，不重复调用 read。 */
  validateValue?: (value: unknown) => string | undefined;
  /** value 已由宿主归一化。 */
  renderControl?: (props: ControlComponentProps) => ReactNode;
  itemControls?: ControlSchema;
}

export type ControlSchema = Record<string, ControlDefinition>;
export type ControlValues<Schema extends ControlSchema> = {
  [Name in keyof Schema]: ReturnType<Schema[Name]["read"]>;
};

export interface PluginEditorProps<Controls = Record<string, unknown>> {
  block: EmailBlockNode;
  controls: Controls;
  style: EmailBlockStyle;
  body: EmailBodySettings;
  variables: Variable[];
  selected: boolean;
  renderedHtml: string;
  select: () => void;
  setControl: <Name extends keyof Controls & string>(name: Name, value: Controls[Name]) => void;
  setControls: (patch: Partial<Controls>) => void;
  setStyle: (id: string, value: string) => void;
}

export interface PluginRenderContext<Controls> extends Omit<BlockRenderContext, "controls"> {
  controls: Controls;
  email: EmailTools;
}

export interface BlockPluginOptions<Schema extends ControlSchema, Type extends string> {
  type: Type;
  title: string;
  icon?: ReactNode | string;
  description?: string;
  override?: boolean;
  controls?: Schema;
  /** 默认 spacing + appearance；false 禁用默认容器控件。 */
  containerStyles?: boolean | { spacing?: boolean; appearance?: boolean };
  styleControls?: StyleControlConfig[];
  inspectorSections?: BlockInspectorSection[];
  defaultStyle?: EmailBlockStyle;
  defaultData?: Record<string, unknown>;
  Canvas?: ComponentType<PluginEditorProps<ControlValues<Schema>>>;
  Inspector?: ComponentType<PluginEditorProps<ControlValues<Schema>>>;
  renderEmail: (ctx: PluginRenderContext<ControlValues<Schema>>) => string | EmailMarkup;
}

/** 只通过 defineBlock 创建；配置同时用于编辑、节点创建和邮件导出。 */
export interface BlockPlugin<Schema extends ControlSchema = ControlSchema, Type extends string = string> extends BlockDefinition {
  type: Type;
  schema: Schema;
}

export interface ImagePickerContext {
  value: string;
  label: string;
  signal: AbortSignal;
}

export interface ValidationIssue {
  blockId: string;
  blockType: string;
  controlPath: string;
  message: string;
}

export interface EmailEditorConfigOptions {
  plugins?: BlockPlugin[];
  /** false 隐藏全部内置区块；数组声明显示顺序。隐藏不影响已有节点渲染。 */
  builtins?: false | string[];
  pickImage?: (context: ImagePickerContext) => Promise<string | null>;
}

export interface EmailEditorConfig {
  readonly definitions: readonly BlockPlugin[];
  readonly library: readonly BlockPlugin[];
  readonly pickImage?: EmailEditorConfigOptions["pickImage"];
  createBlock: (type: string) => EmailBlockNode;
  toHtml: (document: EmailDocument, options?: DocumentHtmlOptions) => string;
  validate: (document: EmailDocument) => ValidationIssue[];
}
