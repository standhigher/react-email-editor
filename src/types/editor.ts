import type { BlockDefinition, Variable } from "./block";
import type { EmailBlockNode, EmailDocument, EmailGlobalSettings } from "./document";

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

export interface EmailEditorData {
  document: EmailDocument;
  json: string;
  html: string;
  renderedHtml: string;
}

export interface EmailEditorHandle {
  getData: () => EmailEditorData;
  getDocument: () => EmailDocument;
  getJson: () => string;
  getHtml: () => string;
  getRenderedHtml: () => string;
}

export interface EmailEditorProps {
  initialDocument?: EmailDocument;
  /** External global settings. Incoming changes are applied to the open document. */
  global?: Partial<EmailGlobalSettings>;
  blocks?: BlockDefinition[];
  variables?: Variable[];
  height?: number | string;
  onChange?: (document: EmailDocument) => void;
  onGlobalChange?: (global: EmailGlobalSettings) => void;
}

export interface EditorSession {
  document: EmailDocument;
  getDocument: () => EmailDocument;
  definitions: BlockDefinition[];
  variables: Variable[];
  selectedId: string | null;
  selectedBlock: EmailBlockNode | null;
  selectedDefinition: BlockDefinition | undefined;
  selectBlock: (id: string | null) => void;
  insertBlock: (type: string, index?: number) => boolean;
  updateField: (id: string, name: string, value: unknown) => void;
  updateStyle: (id: string, styleId: string, value: string) => void;
  updateGlobal: (patch: Partial<EmailGlobalSettings>) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  duplicateBlock: (id: string) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  setSubject: (subject: string) => void;
}
