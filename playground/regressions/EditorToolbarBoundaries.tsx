import { useLayoutEffect, useState } from "react";
import type { EmailEditorInstance } from "../../src/index";

const packageUrl = new URL("../../dist/index.js", import.meta.url).href;
const { createEmailDocument, EmailEditor, useEmailEditor, useEmailEditorConfig }: typeof import("../../src/index") = await import(/* @vite-ignore */ packageUrl);

interface EditorToolbarBoundariesProps {
  onReady: (editor: EmailEditorInstance) => void;
}

export function EditorToolbarBoundaries({ onReady }: EditorToolbarBoundariesProps) {
  const config = useEmailEditorConfig();
  const [initialDocument] = useState(() => {
    const heading = config.createBlock("heading");
    const text = config.createBlock("text");
    const button = config.createBlock("button");
    heading.controls.html = "<p>Heading boundary</p>";
    text.controls.html = "<p>Text boundary</p>";
    button.controls.html = "<p>Button boundary</p>";
    const spacers = Array.from({ length: 3 }, () => {
      const spacer = config.createBlock("spacer");
      spacer.controls.height = 240;
      return spacer;
    });
    return createEmailDocument([heading, text, button, ...spacers]);
  });
  const editor = useEmailEditor({ config, initialDocument, variables: [{ name: "{{ name }}", value: "Boundary" }] });
  useLayoutEffect(() => { onReady(editor); }, [editor, onReady]);
  return <EmailEditor editor={editor} height={600} />;
}
