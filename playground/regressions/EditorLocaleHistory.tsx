import { useLayoutEffect, useRef, useState } from "react";
import type { EmailEditorInstance } from "../../src/index";

// 运行时验证构建产物；类型来自源码，让干净检出的 typecheck 不依赖预先构建。
const packageUrl = new URL("../../dist/index.js", import.meta.url).href;
const { createEmailDocument, defineBlock, EmailControls, EmailEditor, useEmailEditor, useEmailEditorConfig }: typeof import("../../src/index") = await import(/* @vite-ignore */ packageUrl);

const plugin = defineBlock({
  type: "regression.rich-text", title: "History regression",
  controls: { html: EmailControls.richText({ label: "Business content", defaultValue: "<p>First</p>", inline: true }) },
  defaultStyle: { decorations: { borderWidth: "1px" } },
  renderEmail: ({ controls }) => controls.html,
});

export interface LocaleHistoryHarness {
  editor: EmailEditorInstance;
  setLocale: (locale: string) => void;
  changes: { count: number };
}

interface EditorLocaleHistoryProps {
  onReady: (harness: LocaleHistoryHarness) => void;
}

export function EditorLocaleHistory({ onReady }: EditorLocaleHistoryProps) {
  const [locale, setLocale] = useState("en");
  const changes = useRef({ count: 0 });
  const config = useEmailEditorConfig({ plugins: [plugin], builtins: false });
  const [initialDocument] = useState(() => createEmailDocument([config.createBlock(plugin.type)]));
  const editor = useEmailEditor({ config, initialDocument, onChange: () => { changes.current.count++; } });
  useLayoutEffect(() => { onReady({ editor, setLocale, changes: changes.current }); }, [editor, onReady]);
  return <EmailEditor editor={editor} locale={locale} height={650} />;
}
