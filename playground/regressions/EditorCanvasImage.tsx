import { useLayoutEffect, useState } from "react";
import type { EmailBodySettings, EmailEditorInstance } from "../../src/index";

const packageUrl = new URL("../../dist/index.js", import.meta.url).href;
const { createEmailDocument, EmailEditor, useEmailEditor, useEmailEditorConfig }: typeof import("../../src/index") = await import(/* @vite-ignore */ packageUrl);

export interface CanvasImageHarness {
  editor: EmailEditorInstance;
  setBody: (body: Partial<EmailBodySettings>) => void;
  setColor: (color: string) => void;
  setSvgHref: (href: string) => void;
}

interface EditorCanvasImageProps {
  onReady: (harness: CanvasImageHarness) => void;
}

export function EditorCanvasImage({ onReady }: EditorCanvasImageProps) {
  const config = useEmailEditorConfig();
  const [body, setBody] = useState<Partial<EmailBodySettings>>({});
  const [color, setColor] = useState("#ff0000");
  const [svgHref, setSvgHref] = useState("");
  const [initialDocument] = useState(() => {
    const image = config.createBlock("image");
    image.controls.src = new URL("./canvas-image.svg", window.location.href).href;
    image.controls.link = "https://example.com";
    const html = config.createBlock("html");
    html.controls.html = '<!DOCTYPE html><html><head><style>.probe{color:{{ color }};}</style></head><body><p class="probe">{{ caption }}</p><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="30"><defs><rect id="shape" width="10" height="10"/><rect id="wide" width="20" height="10"/></defs><use {{if .svgHref}}xlink:href="{{ svgHref }}"{{end}}></use></svg></body></html>';
    return createEmailDocument([image, html]);
  });
  const editor = useEmailEditor({
    config, initialDocument, body,
    variables: [{ name: "{{ color }}", value: color }, { name: "{{ caption }}", value: "Canvas regression" }, { name: "{{ svgHref }}", value: svgHref }],
  });
  useLayoutEffect(() => { onReady({ editor, setBody, setColor, setSvgHref }); }, [editor, onReady]);
  return <EmailEditor editor={editor} height={700} />;
}
