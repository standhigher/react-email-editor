"use client";

import { EmailEditorShell } from "./shell/EmailEditorShell";
import type { EmailEditorProps } from "./types/editor";

export type { EmailEditorInstance, EmailEditorProps, UseEmailEditorOptions } from "./types/editor";

export function EmailEditor(props: EmailEditorProps) {
  return <EmailEditorShell {...props} />;
}
