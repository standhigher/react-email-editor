"use client";

import { useSyncExternalStore } from "react";
import type { EmailEditorInstance, EmailEditorState } from "../types/editor";
import { getEditorStore } from "./editor-store";

export function useEmailEditorState(editor: EmailEditorInstance): EmailEditorState {
  const store = getEditorStore(editor);
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
