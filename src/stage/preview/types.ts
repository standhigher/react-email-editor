import type { EmailEditorConfig } from "../../plugins/types";
import type { Variable } from "../../types/block";
import type { EmailDocument } from "../../types/document";
import type { EditorDevice } from "../../types/editor";

export interface PreviewSource {
  document: EmailDocument;
  config: EmailEditorConfig;
  variables: Variable[];
  device: EditorDevice;
}

export interface PreviewAttempt {
  source: PreviewSource;
  requestKey: number;
}

export interface PreviewSnapshot {
  id: number;
  source: PreviewSource;
  html: string;
  width: string;
  status: "loading" | "ready" | "failed";
}

export interface PreviewFailure {
  source: PreviewSource;
  message: string;
}

export interface PreviewBufferState {
  frames: [PreviewSnapshot | null, PreviewSnapshot | null];
  front: number | null;
  failure: PreviewFailure | null;
}

export type PreviewBufferAction =
  | { type: "generated"; snapshot: PreviewSnapshot; force: boolean }
  | { type: "ready"; id: number; source: PreviewSource }
  | { type: "failed"; failure: PreviewFailure; id?: number };
