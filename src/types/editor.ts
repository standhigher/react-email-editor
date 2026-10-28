import type { EmailEditorConfig, ValidationIssue } from "../plugins/types";
import type { BlockDefinition, Variable } from "./block";
import type { EmailBlockNode, EmailDocument, EmailBodySettings } from "./document";

export type EditorViewMode = "edit" | "preview";

export type EditorDevice = "desktop" | "mobile";

export interface LibraryDragData {
  kind: "library";
  type: string;
}

export interface CanvasDragData {
  kind: "canvas";
}

export type BlockDragData = LibraryDragData | CanvasDragData;

/** Independent export snapshot. */
export interface EmailEditorData {
  /** Document snapshot for persistence and reloading. */
  document: EmailDocument;
  /** Pretty-printed document JSON. */
  json: string;
  /** Complete email HTML preserving templates. */
  html: string;
  /** Complete HTML resolved with preview data. */
  renderedHtml: string;
}

/** Stable editor instance independent of UI mounting. */
export interface EmailEditorInstance {
  /** Read all export formats; rendering errors throw. */
  getData: () => EmailEditorData;
  /** Read a detached document snapshot. */
  getDocument: () => EmailDocument;
  /** Read pretty-printed document JSON. */
  getJson: () => string;
  /** Export complete email HTML preserving templates. */
  getHtml: () => string;
  /** Export HTML with current preview data. */
  getRenderedHtml: () => string;
  /** Replace with a v4 document, clear interaction state and notify onChange. */
  setDocument: (document: EmailDocument) => void;
  /** Restore initialized document and body, clear interaction state and notify. */
  reset: () => void;
  /** Validate controls and return issues without rendering HTML. */
  validate: () => ValidationIssue[];
}

/** Editor UI props. */
export interface EmailEditorProps {
  /** Required instance created by useEmailEditor. */
  editor: EmailEditorInstance;
  /** Height, default 100%; numbers are px; percentages need a sized parent. */
  height?: number | string;
}

type ReadonlyData<T> = T extends object ? { readonly [Key in keyof T]: ReadonlyData<T[Key]> } : T;

/** Cached readonly document subscription snapshot. */
export interface EmailEditorState {
  /** Deeply readonly document; update through instance methods. */
  readonly document: ReadonlyData<EmailDocument>;
}

/** Editor initialization and reactive options. */
export interface UseEmailEditorOptions {
  /** Read once; use setDocument for later replacements; defaults to empty. */
  initialDocument?: EmailDocument;
  /** Initial body overrides; later changes merge into the current body. */
  body?: Partial<EmailBodySettings>;
  /** Block/resource configuration; defaults to all builtins; updates preserve the document. */
  config?: EmailEditorConfig;
  /** Insertable preview variables, default []; updates affect preview/export. */
  variables?: Variable[];
  /** Detached document after changes, replacements, resets or effective body updates; no initial call. */
  onChange?: (document: EmailDocument) => void;
  /** Detached body snapshot after body edits inside the editor only. */
  onBodyChange?: (body: EmailBodySettings) => void;
}

export interface EditorSession extends EmailEditorInstance {
  resetKey: string;
  document: EmailDocument;
  getDocument: () => EmailDocument;
  definitions: readonly BlockDefinition[];
  config: EmailEditorConfig;
  variables: Variable[];
  selectedId: string | null;
  selectedBlock: EmailBlockNode | null;
  selectedDefinition: BlockDefinition | undefined;
  selectBlock: (id: string | null) => void;
  insertBlock: (type: string, index?: number) => boolean;
  updateControl: (id: string, name: string, value: unknown) => void;
  updateControls: (id: string, patch: Record<string, unknown>) => void;
  updateStyle: (id: string, styleId: string, value: string) => void;
  updateBody: (patch: Partial<EmailBodySettings>) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  duplicateBlock: (id: string) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  setSubject: (subject: string) => void;
}
