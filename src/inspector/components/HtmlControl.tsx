import { useId, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { useEditorTranslation } from "../../i18n/context";
import { HtmlCodeEditor, type HtmlCodeEditorHandle } from "../HtmlCodeEditor";
import { HtmlEditorDialog } from "./HtmlEditorDialog";
import type { ControlRendererProps } from "../ControlRenderer";

export function HtmlControl({ control, value, variables, onChange }: ControlRendererProps) {
  const t = useEditorTranslation();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const editorRef = useRef<HtmlCodeEditorHandle>(null);
  const [expanded, setExpanded] = useState(false);
  const shown = value == null ? "" : String(value);
  const close = () => {
    setExpanded(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="ree-field">
      <div className="ree-field-label">
        <span id={id}>{control.label}</span>
        <Button
          variant="icon"
          className="ree-html-expand"
          aria-label={t("inspector.expandHtml")}
          tooltip={t("inspector.expandHtml")}
          aria-haspopup="dialog"
          aria-expanded={expanded}
          onClick={(event) => {
            triggerRef.current = event.currentTarget;
            setExpanded(true);
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H3v5M3 3l7 7M16 21h5v-5m0 5-7-7M16 3h5v5m0-5-7 7M8 21H3v-5m0 5 7-7" />
          </svg>
        </Button>
      </div>
      <HtmlCodeEditor ref={editorRef} value={shown} labelledBy={id} placeholder={control.placeholder} rows={control.rows} onChange={onChange} />
      {expanded ? <HtmlEditorDialog label={control.label} variables={variables} editorRef={editorRef} onClose={close} /> : null}
    </div>
  );
}
