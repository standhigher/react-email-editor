import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { EmailEditorInstance } from "../../src/index";
import { EditorToolbarBoundaries } from "./EditorToolbarBoundaries";
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
  throw new Error("等待工具栏定位超时");
}

const result = document.querySelector<HTMLPreElement>("#result")!;
const host = document.querySelector<HTMLDivElement>("#root")!;
const reports: string[] = [];
let instance: EmailEditorInstance | undefined;
const receive = (editor: EmailEditorInstance) => { instance = editor; };
createRoot(host).render(createElement(EditorToolbarBoundaries, { onReady: receive }));

async function run() {
  const editor = await until(() => instance);
  let canvas = await until(() => host.querySelector<HTMLElement>(".ree-canvas") ?? undefined);
  const rich = await until(() => host.querySelector<HTMLElement>('.ree-rte [contenteditable="true"]') ?? undefined);
  const baseline = editor.getJson();
  rich.click();
  const toolbar = await until(() => host.querySelector<HTMLElement>(".ree-rte-toolbar.is-placed") ?? undefined);
  const block = rich.closest<HTMLElement>(".ree-block")!;
  const actions = block.querySelector<HTMLElement>(".ree-block-toolbar")!;
  const report = (text: string) => { reports.push(`PASS：${text}`); };
  const inside = () => {
    const rect = toolbar.getBoundingClientRect();
    const bounds = canvas.getBoundingClientRect();
    return rect.left >= bounds.left && rect.right <= Math.min(bounds.right, innerWidth)
      && rect.top >= bounds.top && rect.bottom <= Math.min(bounds.bottom, innerHeight);
  };

  await until(() => inside() && toolbar.getBoundingClientRect().top >= actions.getBoundingClientRect().bottom + 3 || undefined);
  check(editor.getJson() === baseline, "定位改变文档内容");
  report("上方画布空间不足时下翻到 Action 栏下方，工具栏完整位于画布内");

  const font = toolbar.querySelector<HTMLButtonElement>('button[title="Font"]')!;
  font.click();
  await until(() => toolbar.querySelector(".ree-rte-menu") ?? undefined);
  toolbar.querySelector<HTMLButtonElement>(".ree-rte-option")!.click();
  await until(() => !toolbar.querySelector(".ree-rte-menu") || undefined);
  actions.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')!.click();
  await until(() => !host.querySelector(".ree-rte-toolbar") || undefined);
  actions.querySelector<HTMLButtonElement>('button[aria-expanded="false"]')!.click();
  await until(() => host.querySelector(".ree-rte-toolbar.is-placed") ?? undefined);
  report("下翻后字体菜单、收起与展开正常");

  // 宽度变化不触发 window.resize，也必须跟随画布 ResizeObserver 重新定位。
  host.style.width = "1280px";
  const wideDocument = editor.getDocument();
  wideDocument.body.contentWidth = 800;
  editor.setDocument(wideDocument);
  await until(() => !host.querySelector(".ree-block.is-selected") || undefined);
  canvas = host.querySelector<HTMLElement>(".ree-canvas")!;
  host.querySelector<HTMLElement>('.ree-rte [contenteditable="true"]')!.click();
  const wideToolbar = await until(() => host.querySelector<HTMLElement>(".ree-rte-toolbar.is-placed") ?? undefined);
  const wideBlock = host.querySelector<HTMLElement>(".ree-block.is-selected")!;
  const wideActions = wideBlock.querySelector<HTMLElement>(".ree-block-toolbar")!;
  await until(() => wideToolbar.getBoundingClientRect().bottom < wideBlock.getBoundingClientRect().top || undefined);
  report("上方空间充足时保持区块上方展示");

  host.style.width = "1030px";
  await until(() => wideToolbar.getBoundingClientRect().right <= canvas.getBoundingClientRect().right
    && wideToolbar.getBoundingClientRect().top >= wideActions.getBoundingClientRect().bottom || undefined);
  canvas.scrollTop = 50;
  await until(() => wideToolbar.getBoundingClientRect().top >= wideActions.getBoundingClientRect().bottom
    && wideToolbar.getBoundingClientRect().top < canvas.getBoundingClientRect().top + 200 || undefined);
  canvas.scrollTop = 400;
  await until(() => !wideToolbar.classList.contains("is-placed") || undefined);
  canvas.scrollTop = 0;
  await until(() => wideToolbar.classList.contains("is-placed") || undefined);
  report("容器缩窄与画布滚动重新定位，区块离开可视区域时隐藏");

  const menuInside = (menu: HTMLElement) => {
    const rect = menu.getBoundingClientRect();
    const bounds = canvas.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.left >= bounds.left
      && rect.right <= Math.min(bounds.right, innerWidth) && rect.top >= Math.max(0, bounds.top)
      && rect.bottom <= Math.min(bounds.bottom, innerHeight);
  };
  wideToolbar.querySelector<HTMLButtonElement>('button[aria-label="Emoji"]')!.click();
  const emojiMenu = await until(() => wideToolbar.querySelector<HTMLElement>(".ree-rte-menu") ?? undefined);
  await until(() => menuInside(emojiMenu) || undefined);
  const emoji = emojiMenu.querySelector<HTMLButtonElement>("button")!;
  const emojiRect = emoji.getBoundingClientRect();
  check(document.elementFromPoint(emojiRect.left + emojiRect.width / 2, emojiRect.top + emojiRect.height / 2)?.closest("button") === emoji, "Emoji 选项被裁切或遮挡");
  emoji.click();
  await until(() => editor.getJson().includes("😀") || undefined);
  wideToolbar.querySelector<HTMLButtonElement>('button[title="Font"]')!.click();
  const fontMenu = await until(() => wideToolbar.querySelector<HTMLElement>(".ree-rte-menu") ?? undefined);
  host.style.width = "1100px";
  canvas.scrollTop = 20;
  await until(() => menuInside(fontMenu) || undefined);
  fontMenu.querySelector<HTMLButtonElement>("button")!.click();
  host.style.width = "1030px";
  report("换行后的 Emoji 菜单完整可见且选项可点击，字体菜单跟随滚动与容器变化");

  const normalDocument = editor.getDocument();
  const longDocument = editor.getDocument();
  longDocument.blocks = longDocument.blocks.slice(0, 1);
  longDocument.blocks[0].controls.html = Array.from({ length: 10 }, (_, index) => `<p>Boundary line ${index + 1}</p>`).join("");
  editor.setDocument(longDocument);
  const longBaseline = editor.getJson();
  await until(() => !host.querySelector(".ree-block.is-selected") || undefined);
  canvas = host.querySelector<HTMLElement>(".ree-canvas")!;
  host.querySelector<HTMLElement>('.ree-rte-heading [contenteditable="true"]')!.click();
  const longToolbar = await until(() => host.querySelector<HTMLElement>(".ree-rte-toolbar.is-placed") ?? undefined);
  const longActions = host.querySelector<HTMLElement>(".ree-block.is-selected > .ree-block-toolbar")!;
  const clearActions = () => {
    const rect = longToolbar.getBoundingClientRect();
    return longToolbar.classList.contains("is-placed") && rect.top >= longActions.getBoundingClientRect().bottom + 3
      && rect.bottom <= Math.min(canvas.getBoundingClientRect().bottom, innerHeight) + 1;
  };
  await until(() => clearActions() && canvas.scrollTop > 0 || undefined);
  check(editor.getJson() === longBaseline, "滚动留白改变文档内容");
  const actionButton = longActions.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')!;
  const actionRect = actionButton.getBoundingClientRect();
  check(document.elementFromPoint(actionRect.left + actionRect.width / 2, actionRect.top + actionRect.height / 2)?.closest("button") === actionButton, "长文本的 Action 按钮被遮挡");
  const shell = host.querySelector<HTMLElement>(".ree-root")!;
  shell.style.height = "260px";
  await until(() => clearActions() && longToolbar.scrollHeight > longToolbar.clientHeight || undefined);
  check(longToolbar.clientHeight > 0, "低高度工具栏无法滚动操作");
  longToolbar.scrollTop = longToolbar.scrollHeight;
  longToolbar.querySelector<HTMLButtonElement>('button[aria-label="Emoji"]')!.click();
  const shortMenu = await until(() => longToolbar.querySelector<HTMLElement>(".ree-rte-menu") ?? undefined);
  await until(() => menuInside(shortMenu) || undefined);
  shortMenu.querySelector<HTMLButtonElement>("button")!.click();
  shell.style.height = "600px";
  await until(() => clearActions() || undefined);
  report("最后一个长文本区块自动补足滚动空间，不遮挡 Action；低高度工具栏内部可滚动");

  editor.setDocument(normalDocument);
  await until(() => !host.querySelector(".ree-block.is-selected") || undefined);
  canvas = host.querySelector<HTMLElement>(".ree-canvas")!;
  check(!canvas.style.getPropertyValue("--ree-toolbar-space"), "旧工具栏滚动留白未清理");

  for (const profile of ["text", "button"]) {
    host.querySelector<HTMLElement>(`.ree-rte-${profile} [contenteditable="true"]`)!.click();
    await until(() => host.querySelector(`.ree-block.is-selected .ree-rte-${profile}`) ?? undefined);
    const current = await until(() => host.querySelector<HTMLElement>(".ree-rte-toolbar.is-placed") ?? undefined);
    const bounds = current.getBoundingClientRect();
    check(bounds.left >= canvas.getBoundingClientRect().left && bounds.right <= canvas.getBoundingClientRect().right, `${profile}: 工具栏横向溢出`);
    check(current.scrollWidth <= current.clientWidth, `${profile}: 工具栏内部溢出`);
  }
  report("Text 和紧凑 Button 工具栏横向完整展示");
  check(!editor.getHtml().includes("ree-rte-toolbar"), "邮件导出包含编辑工具栏");

  if (window === window.top) {
    const frame = window.document.createElement("iframe");
    frame.width = "1040";
    frame.height = "900";
    const entry = new URL("./toolbar-boundaries.ts", location.href).href;
    const refresh = new URL("/@react-refresh", location.href).href;
    frame.srcdoc = `<!DOCTYPE html><html><head><title>iframe 工具栏回归</title>
      <style>body{margin:0}#root{width:1030px}#root .ree-col-left{width:52px}#result{height:80px;overflow:auto;white-space:pre-wrap}</style></head><body>
      <pre id="result">运行中…</pre><div id="root"></div>
      <script type="module">import { injectIntoGlobalHook } from "${refresh}";
      injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type;</script>
      <script type="module" src="${entry}"></script></body></html>`;
    window.document.body.append(frame);
    frame.scrollIntoView();
    try {
      await until(() => {
        const status = frame.contentDocument?.querySelector<HTMLElement>("#result");
        check(status?.dataset.status !== "failed", status?.textContent ?? "iframe 回归失败");
        return status?.dataset.status === "passed" || undefined;
      });
    } finally {
      frame.remove();
      window.scrollTo(0, 0);
    }
    report("iframe 内运行同一套边界及交互验证通过");
  }
  result.textContent = `${reports.join("\n")}\n全部通过`;
  result.dataset.status = "passed";
}

run().catch((error: unknown) => {
  result.textContent = `${reports.join("\n")}\nFAIL: ${error instanceof Error ? error.message : String(error)}`;
  result.dataset.status = "failed";
});
