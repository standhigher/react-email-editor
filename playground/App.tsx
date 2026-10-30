import { useState } from "react";
import { usePlaygroundConfig } from "./plugins/config";
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";
import { sampleDocument, sampleVariables } from "./sample";
import { EditorActions } from "./EditorActions";
import "./styles.css";

export function App() {
  const [locale, setLocale] = useState("en");
  const config = usePlaygroundConfig(locale);
  const editor = useEmailEditor({
    config,
    initialDocument: sampleDocument,
    variables: sampleVariables,
  });
  return <div className="ree-demo-app">
    <EditorActions editor={editor} locale={locale} onLocaleChange={setLocale} />
    <div className="ree-demo-editor"><EmailEditor editor={editor} height="100%" /></div>
  </div>;
}
