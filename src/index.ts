export { EmailEditor } from "./EmailEditor";
export type {
  EmailEditorData,
  EmailEditorHandle,
  EmailEditorProps,
} from "./types/editor";
export { RichText } from "./stage/rich-text/RichText";
export { DEFAULT_BLOCKS } from "./blocks/registry";
export { createEmailDocument } from "./document/create-document";
export { createBlockNode } from "./document/create-block";
export { documentToHtml } from "./render/document-html";
export { blockToHtml, renderBlock } from "./render/block-html";
export { buildRenderContext } from "./render/context";
export { getBlockDefinition } from "./document/registry";
export { generateId } from "./utils/id";
export type { RenderMode } from "./types/block";
export { STYLE_GROUPS } from "./constants/style-groups";
export type {
  EmailDocument,
  EmailBlockNode,
  EmailBlockStyle,
} from "./types/document";
export type {
  BlockDefinition,
  BlockRenderContext,
  FieldConfig,
  StyleFieldConfig,
  StyleControlType,
  FieldType,
  StyleGroup,
  Variable,
} from "./types/block";
