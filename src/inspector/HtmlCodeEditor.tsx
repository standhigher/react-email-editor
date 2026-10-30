import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, type CSSProperties } from "react";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import { EditorView, placeholder as codePlaceholder } from "@codemirror/view";
import { createHtmlEditorExtensions } from "./html-editor";

interface HtmlCodeEditorProps {
  value: string;
  placeholder?: string;
  rows?: number;
  labelledBy?: string;
  onChange: (value: string) => void;
}

export interface HtmlCodeEditorHandle {
  insertText: (text: string) => void;
  moveTo: (host: HTMLElement | null) => void;
}

const LINE_HEIGHT = 22;

export const HtmlCodeEditor = forwardRef<HtmlCodeEditorHandle, HtmlCodeEditorProps>(function HtmlCodeEditor({
  value,
  placeholder,
  rows = 10,
  labelledBy,
  onChange,
}, ref) {
  const placeholderCompartment = useRef(new Compartment());
  const labelCompartment = useRef(new Compartment());
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    moveTo(host) {
      const view = viewRef.current;
      const originalHost = hostRef.current;
      if (!view || !originalHost) return;
      (host ?? originalHost).appendChild(view.dom);
      originalHost.hidden = Boolean(host);
      view.requestMeasure();
      if (host) view.focus();
    },
    insertText(text) {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({ ...view.state.replaceSelection(text), scrollIntoView: true, userEvent: "input" });
      view.focus();
    },
  }), []);

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
          labelCompartment.current.of(EditorView.contentAttributes.of({ "aria-labelledby": labelledBy ?? "" })),
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
    viewRef.current?.dispatch({ effects: labelCompartment.current.reconfigure(EditorView.contentAttributes.of({ "aria-labelledby": labelledBy ?? "" })) });
  }, [labelledBy]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      annotations: [Transaction.remote.of(true), Transaction.addToHistory.of(false)],
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
});
