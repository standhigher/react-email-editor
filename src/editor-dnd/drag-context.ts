import { createContext, useContext } from "react";

interface EditorDragState {
  overId: string | null;
}

export const EditorDragContext = createContext<EditorDragState>({ overId: null });

export function useEditorDragState(): EditorDragState {
  return useContext(EditorDragContext);
}
