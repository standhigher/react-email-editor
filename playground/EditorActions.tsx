import { useState } from "react";
import { SelectControl, Button, createEmailDocument, useEmailEditorState, type EmailEditorData, type EmailEditorInstance } from "@standhigher/react-email-editor";

import { EDITOR_LOCALES } from "./constants";

interface EditorActionsProps {
  editor: EmailEditorInstance;
  locale: string;
  onLocaleChange: (locale: string) => void;
}

export function EditorActions({ editor, locale, onLocaleChange }: EditorActionsProps) {
  const { document } = useEmailEditorState(editor);
  const [exported, setExported] = useState<EmailEditorData | null>(null);
  const [error, setError] = useState("");
  const exportEmail = () => {
    try {
      const data = editor.getData();
      setExported(data);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return <>
    <div className="ree-demo-actions">
      <SelectControl label="Editor language" value={locale} options={EDITOR_LOCALES} onChange={onLocaleChange} />
      <Button onClick={exportEmail}>Export</Button>
      <Button onClick={() => { editor.setDocument(createEmailDocument()); setExported(null); setError(""); }}>New document</Button>
      <Button onClick={() => { editor.reset(); setExported(null); setError(""); }}>Reset</Button>
      <output aria-live="polite">{document.blocks.length} blocks</output>
      {error && <span role="alert">{error}</span>}
    </div>
    {exported && <section className="ree-demo-export" aria-label="Email export">
      <div className="ree-demo-actions">
        <strong>{exported.document.subject || "Untitled email"}</strong>
        <Button onClick={() => setExported(null)}>Close export</Button>
      </div>
      <label>Document JSON<textarea aria-label="Exported JSON" value={exported.json} readOnly /></label>
      <label>Email HTML<textarea aria-label="Exported HTML" value={exported.html} readOnly /></label>
    </section>}
  </>;
}
