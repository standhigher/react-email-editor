"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Variable } from "./types";

export interface RichTextProps {
  initialHtml: string;
  placeholder?: string;
  variables: Variable[];
  selected: boolean;
  onCommit: (html: string) => void;
  onSelect: () => void;
}

export function RichText({
  initialHtml,
  placeholder,
  variables,
  selected,
  onCommit,
  onSelect,
}: RichTextProps) {
  const [varOpen, setVarOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Type something…" }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onCommit(editor.getHTML()),
  });

  if (!editor) {
    return <div className="ree-rte-loading">Loading editor…</div>;
  }

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL", "https://");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const insertVariable = (name: string) => {
    editor.chain().focus().insertContent(`{{${name}}}`).run();
    setVarOpen(false);
  };

  const btn = (active: boolean) =>
    `ree-tool-btn${active ? " is-active" : ""}`;

  return (
    <div className="ree-rte" onClick={onSelect}>
      {selected ? (
        <div className="ree-rte-toolbar" onMouseDown={(e) => e.preventDefault()}>
          <button
            type="button"
            className={btn(editor.isActive("bold"))}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            className={btn(editor.isActive("italic"))}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            className={btn(editor.isActive("underline"))}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            className={btn(editor.isActive("strike"))}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
            title="Strikethrough"
          >
            S
          </button>
          <button
            type="button"
            className={btn(editor.isActive("link"))}
            onMouseDown={(e) => {
              e.preventDefault();
              setLink();
            }}
            title="Link"
          >
            🔗
          </button>
          {variables.length > 0 ? (
            <div className="ree-var-wrap">
              <button
                type="button"
                className="ree-tool-btn"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setVarOpen((v) => !v);
                }}
                title="Insert variable"
              >
                {"{ }"}
              </button>
              {varOpen ? (
                <div className="ree-var-menu">
                  {variables.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      className="ree-var-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertVariable(v.name);
                      }}
                    >
                      <span className="ree-var-name">{`{{${v.name}}}`}</span>
                      <span className="ree-var-label">{v.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
