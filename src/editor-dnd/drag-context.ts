import { createContext, useContext } from "react";
import type { DropEdge } from "./drop-target";

export interface EditorDragState {
  targetId: string | null;
  dropEdge: DropEdge | null;
}

const emptyDragState: EditorDragState = { targetId: null, dropEdge: null };

export const EditorDragContext = createContext<EditorDragState>(emptyDragState);

export function useEditorDragState(): EditorDragState {
  return useContext(EditorDragContext);
}
