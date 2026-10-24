"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Variable } from "../../types/block";

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
    onUpdate: ({ editor: current }) => onCommit(current.getHTML()),
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === initialHtml) return;
    editor.commands.setContent(initialHtml, { emitUpdate: false });
  }, [editor, initialHtml]);

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

  const toolClass = (active: boolean) =>
    `ree-tool-btn${active ? " is-active" : ""}`;

  return (
    <div className="ree-rte" onClick={onSelect}>
      {selected ? (
        <div className="ree-rte-toolbar" onMouseDown={(event) => event.preventDefault()}>
          <button
            type="button"
            className={toolClass(editor.isActive("bold"))}
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            className={toolClass(editor.isActive("italic"))}
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            className={toolClass(editor.isActive("underline"))}
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            className={toolClass(editor.isActive("strike"))}
            onMouseDown={(event) => {
              event.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
            title="Strikethrough"
          >
            S
          </button>
          <button
            type="button"
            className={toolClass(editor.isActive("link"))}
            onMouseDown={(event) => {
              event.preventDefault();
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
                onMouseDown={(event) => {
                  event.preventDefault();
                  setVarOpen((open) => !open);
                }}
                title="Insert variable"
              >
                {"{ }"}
              </button>
              {varOpen ? (
                <div className="ree-var-menu">
                  {variables.map((variable) => (
                    <button
                      key={variable.name}
                      type="button"
                      className="ree-var-item"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        insertVariable(variable.name);
                      }}
                    >
                      <span className="ree-var-name">{`{{${variable.name}}}`}</span>
                      <span className="ree-var-label">{variable.label}</span>
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
