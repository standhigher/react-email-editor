"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import { DEFAULT_EMAIL_GLOBAL } from "../../document/constants";
import type { Variable } from "../../types/block";
import { RichTextToolbar } from "./components/RichTextToolbar";
import { createRichTextExtensions } from "./extensions";
import { preserveTemplateSpaces, restoreTemplateSpaces } from "./template-spaces";
import type { RichTextInheritedStyle } from "./types";

export interface RichTextProps {
  initialHtml: string;
  placeholder?: string;
  variables: Variable[];
  selected: boolean;
  toolbarId: string;
  toolbarCollapsed: boolean;
  inherited?: RichTextInheritedStyle;
  onCommit: (html: string) => void;
  onSelect: () => void;
}

const DEFAULT_INHERITED: RichTextInheritedStyle = {
  fontFamily: DEFAULT_EMAIL_GLOBAL.fontFamily,
  fontSize: "15px",
  color: DEFAULT_EMAIL_GLOBAL.textColor,
  fontWeight: DEFAULT_EMAIL_GLOBAL.fontWeight,
  lineHeight: DEFAULT_EMAIL_GLOBAL.defaultLineHeight,
  paragraphSpacing: DEFAULT_EMAIL_GLOBAL.paragraphSpacing,
};

export function RichText({
  initialHtml,
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
    extensions: createRichTextExtensions(placeholder ?? "Type something…"),
    content: preserveTemplateSpaces(initialHtml),
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onCommit(restoreTemplateSpaces(current.getHTML())),
  });

  useLayoutEffect(() => {
    const node = rootRef.current;
    const themeRoot = node?.closest(".ree-root");
    setHost(themeRoot instanceof HTMLElement ? themeRoot : node?.ownerDocument.body ?? null);
  }, []);

  useEffect(() => {
    if (!editor || restoreTemplateSpaces(editor.getHTML()) === initialHtml) return;
    editor.commands.setContent(preserveTemplateSpaces(initialHtml), { emitUpdate: false });
  }, [editor, initialHtml]);

  return (
    <div className="ree-rte" ref={rootRef} onClick={onSelect}>
      {selected && !toolbarCollapsed && editor && host
        ? createPortal(
            <RichTextToolbar
              id={toolbarId}
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
