import type { ComponentType, ReactNode } from "react";
import type { ControlDefinition, PluginEditorProps } from "../plugins/types";
import type { EmailBlockNode, EmailBlockStyle, EmailBodySettings } from "./document";

/** Select or alignment control option. */
export interface ControlOption {
  /** Display label. */
  label: string;
  /** Persisted option value. */
  value: string;
}

/** Named runtime control definition. */
export interface ControlConfig extends ControlDefinition {
  /** Key in the controls object. */
  name: string;
}

/** Inspector group identifier. */
export type StyleGroup = "general" | "dimension" | "typography" | "decorations";

/** Union of style input kinds. */
export type StyleControlType =
  | "text"
  | "color"
  | "alignment"
  | "select"
  | "number"
  | "range"
  | "spacing"
  | "corners";

/** Inspector style control declaration. */
export interface StyleControlConfig {
  /** Style path, e.g. dimension.padding. */
  id: string;
  /** Default inspector group. */
  group: StyleGroup;
  /** Display label. */
  label: string;
  /** Style input kind. */
  control: StyleControlType;
  /** Options for select or alignment. */
  options?: ControlOption[];
  /** Single unit suffix; omit for unitless values. */
  unit?: string;
  /** Allowed email CSS units; multiple units show a selector. */
  units?: string[];
  /** Minimum numeric or range value. */
  min?: number;
  /** Maximum numeric or range value. */
  max?: number;
  /** Numeric increment. */
  step?: number;
  /** Default style string; overridden by defaultStyle. */
  defaultValue?: string;
  /** Empty input hint. */
  placeholder?: string;
}

/** Canvas or email consumer mode; independent of template resolution. */
export type RenderMode = "canvas" | "email";

/** Normalized snapshots used by block renderers. */
export interface BlockRenderContext {
  /** Block copy with normalized controls and styles. */
  block: EmailBlockNode;
  /** Values parsed by the plugin readControls. */
  controls: Record<string, unknown>;
  /** Normalized enabled styles. */
  style: EmailBlockStyle;
  /** Canvas or email consumer; templates are processed by the shared renderer. */
  mode: RenderMode;
  /** Copy of email body settings. */
  body: EmailBodySettings;
}

/** Rich-text features for text, heading or button. */
export type RichTextProfile = "text" | "heading" | "button";

/** Inspector section displayed in declaration order. */
export interface BlockInspectorSection {
  /** Optional stable UI identity, independent of the translated title. */
  id?: string;
  /** Section title. */
  title: string;
  /** Content control names in display order. */
  controlNames?: string[];
  /** Style control IDs in display order. */
  styleIds?: string[];
  /** Style IDs inside the collapsed advanced section. */
  advancedStyleIds?: string[];
}

/** Normalized block definition available through plugin values and registry lookups. */
export interface BlockDefinition {
  /** Unique block type. */
  type: string;
  /** Library title. */
  title: string;
  /** Library React icon or string. */
  icon?: ReactNode | string;
  /** Library description. */
  description?: string;
  /** Named controls in declaration order. */
  controls?: ControlConfig[];
  /** Enabled style controls. */
  styleControls?: StyleControlConfig[];
  /** Custom inspector sections. */
  inspectorSections?: BlockInspectorSection[];
  /** Parse a raw control object into normalized values. */
  readControls: (value: Record<string, unknown>) => Record<string, unknown>;
  /** Allow replacing a builtin with the same type. */
  override?: boolean;
  /** Default styles for new nodes. */
  defaultStyle?: EmailBlockStyle;
  /** Template preview data for new nodes. */
  defaultData?: Record<string, unknown>;
  /** Rich-text control edited by the default canvas. */
  inlineControl?: string;
  /** Inspector component bound to the editor context. */
  inspector?: ComponentType<PluginEditorProps>;
  /** Canvas component bound to the editor context. */
  canvas?: ComponentType<PluginEditorProps>;
  /** Render inner HTML from normalized context; email mode validates controls. */
  renderEmail: (ctx: BlockRenderContext) => string;
}

/** Insertable template variable and preview value. */
export interface Variable {
  /** Exact inserted token, e.g. {{ store_name }}; exact matches receive export dot normalization. */
  name: string;
  /** Secondary option text; hidden when absent or empty. */
  description?: string;
  /** Preview replacement text; omitted values add no preview data. */
  value?: string;
}
