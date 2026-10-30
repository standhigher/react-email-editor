import { createContext, useContext } from "react";
import type { EmailEditorConfig, PluginEditorProps } from "./types";
import type { ControlConfig, RichTextProfile } from "../types/block";

export interface PluginEditingContext extends PluginEditorProps {
  toolbarId: string;
  toolbarCollapsed: boolean;
  controlDefinitions: ControlConfig[];
  profiles: Record<string, RichTextProfile | undefined>;
}

export interface RichTextFocus {
  active: string | null;
  activate: (id: string | null) => void;
}

export const RichTextFocusContext = createContext<RichTextFocus>({ active: null, activate: () => {} });

export const PluginEditorContext = createContext<PluginEditingContext | null>(null);
export const EditorConfigContext = createContext<EmailEditorConfig | null>(null);

export function usePluginEditor(): PluginEditingContext {
  const context = useContext(PluginEditorContext);
  if (!context) throw new Error("EditableRichText must be rendered inside a block Canvas or Inspector.");
  return context;
}
