import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Editor } from "@tiptap/react";
import { closeHistory } from "@tiptap/pm/history";
import { EditorLocaleHistory } from "./EditorLocaleHistory";
import type { LocaleHistoryHarness } from "./EditorLocaleHistory";
import "../../dist/styles.css";

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function until<T>(read: () => T | undefined): Promise<T> {
  const deadline = performance.now() + 10000;
  while (performance.now() < deadline) {
    const value = read();
    if (value !== undefined) return value;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  throw new Error("等待编辑器或语言切换超时");
}

const result = document.querySelector<HTMLPreElement>("#result")!;
const host = document.querySelector<HTMLDivElement>("#root")!;
let harness: LocaleHistoryHarness | undefined;
const receive = (value: LocaleHistoryHarness) => { harness = value; };
createRoot(host).render(createElement(EditorLocaleHistory, { onReady: receive }));

async function run() {
  const { editor, setLocale, changes } = await until(() => harness);
  const rich = await until(() => {
    const node = host.querySelector<HTMLElement & { editor?: Editor }>(".tiptap");
    return node?.editor && !node.editor.isDestroyed ? node.editor : undefined;
  });
  rich.view.dom.click();
  rich.commands.focus("end");
  const before = rich.state.doc.toJSON();
  rich.commands.insertContent(" A");
  const first = rich.state.doc.toJSON();
  rich.view.dispatch(closeHistory(rich.state.tr));
  rich.commands.insertContent(" B");
  const second = rich.state.doc.toJSON();
  await until(() => editor.getDocument().blocks[0].controls.html === rich.getHTML() || undefined);
  rich.commands.setTextSelection({ from: 2, to: 4 });
  const selection = rich.state.selection.toJSON();
  const baseline = JSON.stringify(editor.getData());
  const reports: string[] = [];
  for (const locale of ["en", "zh-CN", "es", "pt-PT", "fr", "en"]) {
    const count = changes.count;
    setLocale(locale);
    await until(() => host.querySelector(".ree-root")?.getAttribute("lang") === locale || undefined);
    check(host.querySelector<HTMLElement & { editor?: Editor }>(".tiptap")?.editor === rich && !rich.isDestroyed, `${locale}: 富文本实例被重建`);
    check(JSON.stringify(rich.state.selection.toJSON()) === JSON.stringify(selection), `${locale}: 选区改变`);
    check(JSON.stringify(editor.getData()) === baseline, `${locale}: 文档或导出 HTML 改变`);
    check(changes.count === count, `${locale}: 切换触发 onChange`);
    check(rich.commands.undo(), `${locale}: 第一次撤销失败`);
    check(JSON.stringify(rich.state.doc.toJSON()) === JSON.stringify(first), `${locale}: 第一次撤销顺序错误`);
    check(rich.commands.undo(), `${locale}: 第二次撤销失败`);
    check(JSON.stringify(rich.state.doc.toJSON()) === JSON.stringify(before), `${locale}: 第二次撤销顺序错误`);
    check(rich.commands.redo(), `${locale}: 第一次重做失败`);
    check(JSON.stringify(rich.state.doc.toJSON()) === JSON.stringify(first), `${locale}: 第一次重做顺序错误`);
    check(rich.commands.redo(), `${locale}: 第二次重做失败`);
    check(JSON.stringify(rich.state.doc.toJSON()) === JSON.stringify(second), `${locale}: 第二次重做顺序错误`);
    await until(() => JSON.stringify(editor.getData()) === baseline || undefined);
    rich.commands.setTextSelection({ from: 2, to: 4 });
    reports.push(`${locale}: PASS（实例、选区、JSON、HTML、两步撤销与重做）`);
    result.textContent = reports.join("\n");
  }
  result.textContent += "\n全部通过";
  result.dataset.status = "passed";
}

run().catch((error: unknown) => {
  result.textContent += `\nFAIL: ${error instanceof Error ? error.message : String(error)}`;
  result.dataset.status = "failed";
});
