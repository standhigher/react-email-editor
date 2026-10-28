import type { ComponentType, ReactNode } from "react";
import type { BlockDefinition, BlockInspectorSection, BlockRenderContext, ControlOption, RichTextProfile, StyleControlConfig, Variable } from "../types/block";
import type { EmailBlockNode, EmailBlockStyle, EmailBodySettings, EmailDocument } from "../types/document";
import type { DocumentHtmlOptions } from "../render/document-html";
import type { EmailMarkup, EmailTools } from "./email-tools";

/** Content control kind. */
export type ControlKind = "text" | "textarea" | "html" | "richText" | "url" | "image" | "number" | "color" | "select" | "boolean" | "list" | "custom";

/** Custom control props; T is the value type. */
export interface ControlComponentProps<T = unknown> {
  /** Detached normalized control value. */
  value: T;
  /** Submit the new control value. */
  onChange: (value: T) => void;
  /** Declared control label. */
  label: string;
  /** Current body settings snapshot. */
  body: EmailBodySettings;
  /** Insertable variable snapshots. */
  variables: Variable[];
}

/** Control factory options; T is the default/edit value type. */
export interface ControlOptions<T> {
  /** Required display label. */
  label: string;
  /** Factory fallback when omitted; persisted undefined receives the default. */
  defaultValue?: T;
  /** Empty input hint. */
  placeholder?: string;
  /** Allowed select options. */
  options?: ControlOption[];
  /** Visible textarea or HTML editor rows. */
  rows?: number;
  /** Minimum number or list length. */
  min?: number;
  /** Maximum number or list length. */
  max?: number;
  /** Number input increment. */
  step?: number;
  /** Unit label beside a numeric input. */
  unit?: string;
  /** Rich-text feature profile: text, heading or button. */
  profile?: RichTextProfile;
  /** Edit this richText on the default canvas; multiple regions require Canvas. */
  inline?: boolean;
  /** Custom React control component. */
  component?: ComponentType<ControlComponentProps<T>>;
  /** Validate a normalized value; return an error message or undefined. */
  validate?: (value: T) => string | undefined;
}

/** Factory-produced control definition; T is its parsed value type. */
export interface ControlDefinition<T = unknown> extends Omit<ControlOptions<T>, "component" | "validate"> {
  /** Control kind. */
  kind: ControlKind;
  /** Normalized default value. */
  defaultValue: T;
  /** Parse an unknown persisted value into T; must be pure. */
  read: (value: unknown) => T;
  /** Validate an already normalized value without re-reading. */
  validateValue?: (value: unknown) => string | undefined;
  /** Render React UI from host-normalized control props. */
  renderControl?: (props: ControlComponentProps) => ReactNode;
  /** Child control schema for each list row. */
  itemControls?: ControlSchema;
}

/** Map from control names to definitions. */
export type ControlSchema = Record<string, ControlDefinition>;
/** Infer values from each Schema control read return type. */
export type ControlValues<Schema extends ControlSchema> = {
  [Name in keyof Schema]: ReturnType<Schema[Name]["read"]>;
};

/** Canvas or Inspector props; Controls is the inferred value shape. */
export interface PluginEditorProps<Controls = Record<string, unknown>> {
  /** Detached block snapshot. */
  block: EmailBlockNode;
  /** Normalized control value snapshot. */
  controls: Controls;
  /** Current enabled styles snapshot. */
  style: EmailBlockStyle;
  /** Body settings snapshot. */
  body: EmailBodySettings;
  /** Available variable snapshots. */
  variables: Variable[];
  /** Whether selected; true inside Inspector. */
  selected: boolean;
  /** Resolved inner HTML in Canvas; empty in Inspector. */
  renderedHtml: string;
  /** Request selection of this block. */
  select: () => void;
  /** Update the named control with its typed value. */
  setControl: <Name extends keyof Controls & string>(name: Name, value: Controls[Name]) => void;
  /** Shallow-merge a patch in one update; replace nested values entirely. */
  setControls: (patch: Partial<Controls>) => void;
  /** Update a style path with a CSS string. */
  setStyle: (id: string, value: string) => void;
}

/** Typed email render context; Controls contains inferred values. */
export interface PluginRenderContext<Controls> extends Omit<BlockRenderContext, "controls"> {
  /** Inferred normalized control values. */
  controls: Controls;
  /** Escaping and layout helpers for email HTML. */
  email: EmailTools;
}

/** defineBlock options; Schema infers values and Type preserves the type literal. */
export interface BlockPluginOptions<Schema extends ControlSchema, Type extends string> {
  /** Nonempty unique type; a business prefix is recommended. */
  type: Type;
  /** Nonempty library title. */
  title: string;
  /** Library icon or string. */
  icon?: ReactNode | string;
  /** Library description. */
  description?: string;
  /** Must be true to replace a builtin. */
  override?: boolean;
  /** Control schema, default {}. */
  controls?: Schema;
  /** Container styles enabled by default; false disables all; spacing and appearance select groups. */
  containerStyles?: boolean | {
    /** Enable default padding and margin controls; default true. */
    spacing?: boolean;
    /** Enable default background and border controls; default true. */
    appearance?: boolean;
  };
  /** Extra style controls; matching IDs replace container controls. */
  styleControls?: StyleControlConfig[];
  /** Ordered content and style sections. */
  inspectorSections?: BlockInspectorSection[];
  /** Initial styles, taking precedence over control defaultValue. */
  defaultStyle?: EmailBlockStyle;
  /** Template preview data for new nodes. */
  defaultData?: Record<string, unknown>;
  /** Optional React canvas composing multiple editing regions. */
  Canvas?: ComponentType<PluginEditorProps<ControlValues<Schema>>>;
  /** Optional React inspector replacing the default content editor. */
  Inspector?: ComponentType<PluginEditorProps<ControlValues<Schema>>>;
  /** Render inner HTML or EmailMarkup from typed context, without editor UI. */
  renderEmail: (ctx: PluginRenderContext<ControlValues<Schema>>) => string | EmailMarkup;
}

/** Plugin returned by defineBlock; Schema is its schema and Type its identifier type. */
export interface BlockPlugin<Schema extends ControlSchema = ControlSchema, Type extends string = string> extends BlockDefinition {
  /** Block type literal. */
  type: Type;
  /** Detached frozen snapshot of the control schema. */
  schema: Schema;
}

/** Image resource picker request. */
export interface ImagePickerContext {
  /** Current image URL. */
  value: string;
  /** Label of the requesting control. */
  label: string;
  /** Cancellation signal on unmount or invalidation; pass to resource requests. */
  signal: AbortSignal;
}

/** Document control validation issue. */
export interface ValidationIssue {
  /** Invalid block ID. */
  blockId: string;
  /** Invalid plugin type. */
  blockType: string;
  /** Control path including list row indexes and child controls. */
  controlPath: string;
  /** Displayable error description. */
  message: string;
}

/** Block registration and image resource adapter options. */
export interface UseEmailEditorConfigOptions {
  /** Plugins created by defineBlock, default []. */
  plugins?: BlockPlugin[];
  /** All by default; false hides all; arrays filter/order; hidden nodes still render. */
  builtins?: false | string[];
  /** Resolve a URL from context, return null to cancel, or throw to show retry. */
  pickImage?: (context: ImagePickerContext) => Promise<string | null>;
}

/** Shared configuration for editing, creation and standalone export. */
export interface EmailEditorConfig {
  /** All registered definitions including hidden builtins. */
  readonly definitions: readonly BlockPlugin[];
  /** Insertable blocks in display order. */
  readonly library: readonly BlockPlugin[];
  /** Optional image resource picker. */
  readonly pickImage?: UseEmailEditorConfigOptions["pickImage"];
  /** Create a detached default node for a registered type; unknown types throw. */
  createBlock: (type: string) => EmailBlockNode;
  /** Export a v4 document using this configuration and optional template options. */
  toHtml: (document: EmailDocument, options?: DocumentHtmlOptions) => string;
  /** Return document control issues, including missing plugins. */
  validate: (document: EmailDocument) => ValidationIssue[];
}
