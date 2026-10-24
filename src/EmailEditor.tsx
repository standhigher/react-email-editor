"use client";

import { forwardRef } from "react";
import { EmailEditorShell } from "./shell/EmailEditorShell";
import type { EmailEditorHandle, EmailEditorProps } from "./types/editor";

export type { EmailEditorHandle, EmailEditorProps } from "./types/editor";

export const EmailEditor = forwardRef<EmailEditorHandle, EmailEditorProps>(
  function EmailEditor(props, ref) {
    return <EmailEditorShell {...props} ref={ref} />;
  },
);
