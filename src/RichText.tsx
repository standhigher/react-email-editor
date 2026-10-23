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
      Placeholder.configure({ placeholder: placeholder ?? "输入内容…" }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onCommit(editor.getHTML()),
  });

  if (!editor) {
    return <div className="ree-rte-loading">加载编辑器…</div>;
  }

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("链接地址", "https://");
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
            title="加粗"
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
            title="斜体"
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
            title="下划线"
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
            title="删除线"
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
            title="链接"
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
                title="插入变量"
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
