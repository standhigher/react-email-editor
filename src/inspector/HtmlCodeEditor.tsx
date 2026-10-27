import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { createHtmlEditorExtensions } from "./html-editor";

interface HtmlCodeEditorProps {
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}

const LINE_HEIGHT = 22;

export function HtmlCodeEditor({
  value,
  placeholder,
  rows = 10,
  onChange,
}: HtmlCodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: value,
        extensions: createHtmlEditorExtensions(placeholder ?? "", (next) => {
          onChangeRef.current(next);
        }),
      }),
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor owns the document after mount; later value changes sync below.
    // oxlint-disable-next-line react/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  const minHeight = Math.max(rows, 8) * LINE_HEIGHT;

  return (
    <div
      ref={hostRef}
      className="ree-html-editor"
      style={{ "--ree-html-editor-min": `${minHeight}px` } as CSSProperties}
    />
  );
}
