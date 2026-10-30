import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, placeholder as codePlaceholder } from "@codemirror/view";
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
  const placeholderCompartment = useRef(new Compartment());
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
        extensions: [
          createHtmlEditorExtensions("", (next) => { onChangeRef.current(next); }),
          placeholderCompartment.current.of(codePlaceholder(placeholder ?? "")),
        ],
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
    viewRef.current?.dispatch({ effects: placeholderCompartment.current.reconfigure(codePlaceholder(placeholder ?? "")) });
  }, [placeholder]);

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
