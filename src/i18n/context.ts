import { createContext, useContext } from "react";
import { DEFAULT_TRANSLATION } from "./runtime";
import type { EditorTranslation } from "./types";

export const EditorLocaleContext = createContext<EditorTranslation>(DEFAULT_TRANSLATION);

export function useEditorTranslation() {
  return useContext(EditorLocaleContext).t;
}
