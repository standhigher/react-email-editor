import type { BlockDefinition, Variable } from "./block";
import type { EmailBlockNode, EmailDocument } from "./document";

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
}

export interface EmailEditorHandle {
  getData: () => EmailEditorData;
  getDocument: () => EmailDocument;
  getJson: () => string;
  getHtml: () => string;
}

export interface EmailEditorProps {
  initialDocument?: EmailDocument;
  blocks?: BlockDefinition[];
  variables?: Variable[];
  height?: number | string;
  onChange?: (document: EmailDocument) => void;
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
  insertBlock: (type: string, index?: number) => void;
  updateField: (id: string, name: string, value: unknown) => void;
  updateStyle: (id: string, styleId: string, value: string) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  duplicateBlock: (id: string) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  setSubject: (subject: string) => void;
  reset: () => void;
}
