"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import { DEFAULT_TYPOGRAPHY } from "../../constants/typography";
import type { RichTextProfile, Variable } from "../../types/block";
import { RichTextToolbar } from "./components/RichTextToolbar";
import { createRichTextExtensions } from "./extensions";
import { preserveTemplateSpaces, restoreTemplateSpaces } from "./template-spaces";
import type { RichTextInheritedStyle } from "./types";

/** Low-level rich-text props; prefer EditableRichText in plugins. */
export interface RichTextProps {
  /** Initial and externally synchronized HTML. */
  initialHtml: string;
  /** Feature profile, default text. */
  profile?: RichTextProfile;
  /** Empty hint, default Type something…. */
  placeholder?: string;
  /** Variables available in the toolbar. */
  variables: Variable[];
  /** Whether selected and eligible to show the toolbar. */
  selected: boolean;
  /** Toolbar DOM ID; caller ensures uniqueness. */
  toolbarId: string;
  /** Whether the toolbar is hidden. */
  toolbarCollapsed: boolean;
  /** Inherited typography; defaults to internal typography. */
  inherited?: RichTextInheritedStyle;
  /** Receive complete rich-text HTML after each edit. */
  onCommit: (html: string) => void;
  /** Request selection on click or focus. */
  onSelect: () => void;
}

const DEFAULT_INHERITED: RichTextInheritedStyle = DEFAULT_TYPOGRAPHY;

export function RichText({
  initialHtml,
  profile = "text",
  placeholder,
  variables,
  selected,
  toolbarId,
  toolbarCollapsed,
  inherited = DEFAULT_INHERITED,
  onCommit,
  onSelect,
}: RichTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const editor = useEditor({
    extensions: createRichTextExtensions(placeholder ?? "Type something…", profile),
    content: preserveTemplateSpaces(initialHtml),
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onCommit(restoreTemplateSpaces(current.getHTML())),
  }, [profile]);

  useLayoutEffect(() => {
    const node = rootRef.current;
    const themeRoot = node?.closest(".ree-root");
    setHost(themeRoot instanceof HTMLElement ? themeRoot : node?.ownerDocument.body ?? null);
  }, []);

  useEffect(() => {
    if (!editor || editor.isDestroyed || restoreTemplateSpaces(editor.getHTML()) === initialHtml) return;
    editor.commands.setContent(preserveTemplateSpaces(initialHtml), { emitUpdate: false });
  }, [editor, initialHtml]);

  return (
    <div className={`ree-rte ree-rte-${profile}`} ref={rootRef} onClick={onSelect} onFocusCapture={onSelect}>
      {selected && !toolbarCollapsed && editor && host
        ? createPortal(
            <RichTextToolbar
              id={toolbarId}
              profile={profile}
              editor={editor}
              variables={variables}
              anchorRef={rootRef}
              inherited={inherited}
            />,
            host,
          )
        : null}
      {editor ? <EditorContent editor={editor} /> : <div className="ree-rte-loading">Loading editor…</div>}
    </div>
  );
}
