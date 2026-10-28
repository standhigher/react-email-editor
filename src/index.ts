export { EmailEditor } from "./EmailEditor";
export type {
  EmailEditorData,
  EmailEditorInstance,
  EmailEditorState,
  UseEmailEditorOptions,
  EmailEditorProps,
} from "./types/editor";
export { RichText } from "./stage/rich-text/RichText";
export { DEFAULT_BLOCKS } from "./blocks/registry";
export { createEmailDocument, resolveEmailBody } from "./document/create-document";
export { DEFAULT_EMAIL_BODY } from "./document/constants";
export { createBlockNode } from "./document/create-block";
export {
  createDecorationControls,
  createDimensionControls,
  createTypographyControls,
} from "./blocks/style-controls";
export type {
  DecorationControlName,
  DimensionControlName,
  TypographyControlName,
} from "./blocks/style-controls";
export { documentToHtml } from "./render/document-html";
export type { DocumentHtmlOptions } from "./render/document-html";
export {
  blockToHtml,
  mergeTemplateData,
  renderBlock,
  renderBlockContent,
  variablesToTemplateData,
} from "./render/block-html";
export type { BlockRenderOptions } from "./render/block-html";
export { renderTemplatePreview } from "./render/template-preview";
export type { TemplateData } from "./render/template-preview";
export { buildRenderContext } from "./render/context";
export { getBlockDefinition } from "./document/registry";
export { generateId } from "./utils/id";
export type { RenderMode } from "./types/block";
export { STYLE_GROUPS } from "./constants/style-groups";
export { BLOCK_TYPES } from "./constants/block-types";
export type { BuiltinBlockType } from "./constants/block-types";
export {
  BORDER_STYLES,
  FONT_WEIGHTS,
  HORIZONTAL_ALIGNS,
  LINK_DECORATIONS,
  TEXT_ALIGNS,
} from "./constants/style-values";
export type {
  BorderStyle,
  FontWeight,
  HorizontalAlign,
  LinkDecoration,
  TextAlign,
} from "./constants/style-values";
export { DOCUMENT_VERSION, FONT_FAMILIES } from "./document/constants";
export type {
  EmailDocument,
  EmailBlockNode,
  EmailBlockStyle,
  EmailSpacingStyle,
  EmailTypographyStyle,
  EmailDecorationStyle,
  EmailElementStyle,
  EmailBodySettings,
} from "./types/document";
export type {
  BlockInspectorSection,
  RichTextProfile,
  BlockRenderContext,
  ControlOption,
  StyleControlConfig,
  StyleControlType,
  StyleGroup,
  Variable,
} from "./types/block";

export { defineBlock } from "./plugins/define-block";
export { EmailControls } from "./plugins/controls";
export { useEmailEditorConfig } from "./plugins/useEmailEditorConfig";
export { useEmailEditor } from "./shell/useEmailEditor";
export { useEmailEditorState } from "./shell/useEmailEditorState";
export { EditableRichText } from "./plugins/components/EditableRichText";
export type { EditableRichTextProps } from "./plugins/components/EditableRichText";
export type {
  BlockPlugin, BlockPluginOptions, ControlKind, ControlDefinition, ControlOptions, ControlSchema, ControlValues,
  ControlComponentProps, PluginEditorProps, PluginRenderContext, EmailEditorConfig,
  UseEmailEditorConfigOptions, ImagePickerContext, ValidationIssue,
} from "./plugins/types";
export type { EmailTools, EmailMarkup } from "./plugins/email-tools";

export { TextInput } from "./components/TextInput";
export { SelectControl } from "./components/SelectControl";
export { CheckboxControl } from "./components/CheckboxControl";
export { ColorControl } from "./components/ColorControl";
export { RangeControl } from "./components/RangeControl";
export { Button } from "./components/Button";

export { ControlEditor } from "./plugins/components/ControlEditor";
export type { ControlEditorProps } from "./plugins/components/ControlEditor";
