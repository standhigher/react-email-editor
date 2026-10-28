import type { EmailEditorConfig } from "../plugins/types";
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
  /** External body settings. Incoming changes are applied to the open document. */
  body?: Partial<EmailBodySettings>;
  config?: EmailEditorConfig;
  variables?: Variable[];
  height?: number | string;
  onChange?: (document: EmailDocument) => void;
  onBodyChange?: (body: EmailBodySettings) => void;
}

export interface EditorSession {
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
