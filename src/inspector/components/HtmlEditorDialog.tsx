import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Button } from "../../components/Button";
import { PersonalizationMenu } from "../../components/PersonalizationMenu";
import { useEditorTranslation } from "../../i18n/context";
import type { HtmlCodeEditorHandle } from "../HtmlCodeEditor";
import { HTML_SAVE_TOAST_DURATION } from "../constants";
import type { Variable } from "../../types/block";

interface HtmlEditorDialogProps {
  label: string;
  variables: Variable[];
  editorRef: RefObject<HtmlCodeEditorHandle>;
  onClose: () => void;
}

export function HtmlEditorDialog({ label, variables, editorRef, onClose }: HtmlEditorDialogProps) {
  const t = useEditorTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editorHostRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showSaved, setShowSaved] = useState(false);
  const titleId = useId();
  const hintId = useId();
  const close = () => {
    dialogRef.current?.close();
    onClose();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const editor = editorRef.current;
    dialog?.showModal();
    editor?.moveTo(editorHostRef.current);
    return () => {
      clearTimeout(toastTimer.current);
      editor?.moveTo(null);
      dialog?.close();
    };
  }, [editorRef]);

  return (
    <dialog
      ref={dialogRef}
      className="ree-html-dialog"
      aria-labelledby={titleId}
      aria-describedby={hintId}
      aria-modal="true"
      onKeyDownCapture={(event) => {
        const saveKey = event.key.toLowerCase() === "s" || event.code === "KeyS";
        if (!saveKey || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.repeat) return;
        clearTimeout(toastTimer.current);
        setShowSaved(true);
        toastTimer.current = setTimeout(() => setShowSaved(false), HTML_SAVE_TOAST_DURATION);
      }}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        close();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="ree-html-dialog-header">
        <h2 id={titleId}>{t("inspector.htmlEditor")}{label !== "HTML" ? <span>{label}</span> : null}</h2>
        <div className="ree-html-dialog-actions">
          <PersonalizationMenu variables={variables} onInsert={(name) => editorRef.current?.insertText(name)} />
          <Button variant="icon" aria-label={t("inspector.closeHtmlEditor")} tooltip={t("inspector.closeHtmlEditor")} onClick={close}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </Button>
        </div>
      </div>
      <div className="ree-html-dialog-content">
        <div ref={editorHostRef} className="ree-html-editor" />
      </div>
      <div className="ree-html-dialog-footer">
        <p id={hintId}>{t("inspector.liveHtml")}</p>
        <Button variant="solid" onClick={close}>{t("common.done")}</Button>
      </div>
      <div className="ree-html-save-status" role="status" aria-atomic="true">
        {showSaved ? <div className="ree-html-save-toast">
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="8" /><path d="m6 10 2.5 2.5L14 7" /></svg>
          <span>{t("inspector.htmlSaved")}</span>
        </div> : null}
      </div>
    </dialog>
  );
}
