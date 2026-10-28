import { editorConfig } from "./plugins/config";
import { EmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";
import { sampleDocument, sampleVariables } from "./sample";
import "./styles.css";

export function App() {
  return (
    <EmailEditor
      config={editorConfig}
      height="100%"
      initialDocument={sampleDocument}
      variables={sampleVariables}
    />
  );
}
