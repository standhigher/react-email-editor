import { usePlaygroundConfig } from "./plugins/config";
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";
import { sampleDocument, sampleVariables } from "./sample";
import { EditorActions } from "./EditorActions";
import "./styles.css";

export function App() {
  const config = usePlaygroundConfig();
  const editor = useEmailEditor({
    config,
    initialDocument: sampleDocument,
    variables: sampleVariables,
  });
  return <div className="ree-demo-app">
    <EditorActions editor={editor} />
    <div className="ree-demo-editor"><EmailEditor editor={editor} height="100%" /></div>
  </div>;
}
