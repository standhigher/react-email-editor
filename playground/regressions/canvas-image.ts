import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { EditorCanvasImage } from "./EditorCanvasImage";
import type { CanvasImageHarness } from "./EditorCanvasImage";
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
  throw new Error("等待画布更新超时");
}

const result = document.querySelector<HTMLPreElement>("#result")!;
const host = document.querySelector<HTMLDivElement>("#root")!;
let harness: CanvasImageHarness | undefined;
const receive = (value: CanvasImageHarness) => { harness = value; };
createRoot(host).render(createElement(EditorCanvasImage, { onReady: receive }));

function input(label: string): HTMLInputElement {
  const labelNode = Array.from(host.querySelectorAll("label")).find((node) => node.textContent === label);
  const field = labelNode?.htmlFor ? document.getElementById(labelNode.htmlFor) : null;
  check(field instanceof HTMLInputElement, `找不到输入框：${label}`);
  return field;
}

function type(field: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

async function run() {
  const { editor, setBody, setColor, setSvgHref } = await until(() => harness);
  const frame = await until(() => {
    const node = host.querySelector<HTMLIFrameElement>(".ree-html-canvas-frame");
    return node?.contentDocument?.querySelector("img")?.complete ? node : undefined;
  });
  const frameDocument = frame.contentDocument!;
  const image = frameDocument.querySelector("img")!;
  check(image.naturalWidth > 0, "初始图片加载失败");
  // 缓存命中时 complete 可早于首次 load 事件，先等待初始解码与事件完成。
  await image.decode();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const src = image.src;
  let loads = 0;
  const onLoad = () => { loads++; };
  frame.addEventListener("load", onLoad);
  image.addEventListener("load", onLoad);
  host.querySelector<HTMLButtonElement>(".ree-html-canvas-hitbox")!.click();
  const link = await until(() => host.querySelector<HTMLInputElement>('input[value="https://example.com"]') ?? undefined);
  check(!Array.from(host.querySelectorAll("label")).some((node) => node.textContent === "Alt text"), "仍展示替代文本配置");
  check(!("alt" in editor.getDocument().blocks[0].controls), "新图片区块仍包含 alt 配置");
  check(image.alt === "", "图片 alt 应为空");
  const reports: string[] = [];

  const expected = 'https://example.com/中文?value="<&';
  for (const character of expected.slice("https://example.com".length)) {
    const value = link.value + character;
    type(link, value);
    await until(() => image.closest("a")?.getAttribute("href") === value || undefined);
    check(frame.contentDocument === frameDocument, "输入链接导致 iframe 文档重载");
    check(frameDocument.querySelector("img") === image, "输入链接导致图片节点重建");
    check(image.src === src && loads === 0, "输入链接导致图片重新加载");
    check(editor.getDocument().blocks[0].controls.link === value, "链接未实时写入文档");
  }
  check(editor.getHtml().includes('href="https://example.com/中文?value=&quot;&lt;&amp;"'), "导出链接转义不正确");
  check(editor.getRenderedHtml().includes('href="https://example.com/中文?value=&quot;&lt;&amp;"'), "预览链接不正确");
  reports.push("PASS：无替代文本配置，逐字输入链接中文与特殊字符，iframe、图片节点不变，零 load，文档与导出同步");
  // 超过后台预览的 2 秒 maxWait，覆盖停止输入后发生的延迟资源加载。
  await new Promise<void>((resolve) => setTimeout(resolve, 2300));
  check(host.querySelectorAll(".ree-preview-frame").length === 0, "停止输入后隐藏预览加载了图片");
  check(loads === 0, "停止输入后画布图片重新加载");
  reports.push("PASS：停止输入超过 2 秒，隐藏预览未创建 iframe 或加载资源");

  type(link, "https://example.com/updated");
  await until(() => image.closest("a")?.getAttribute("href") === "https://example.com/updated" || undefined);
  check(frameDocument.querySelector("img") === image && loads === 0, "修改已有链接重新加载图片");
  reports.push("PASS：更新链接保留图片节点");

  setBody({ textColor: "#123456", fontFamily: "Georgia, serif" });
  await until(() => frame.contentWindow?.getComputedStyle(frameDocument.body).color === "rgb(18, 52, 86)" || undefined);
  check(frame.contentDocument === frameDocument && frameDocument.querySelector("img") === image && loads === 0, "更新主体样式重新加载图片");
  const htmlFrame = host.querySelectorAll<HTMLIFrameElement>(".ree-html-canvas-frame")[1];
  const htmlDocument = htmlFrame.contentDocument!;
  const paragraph = htmlDocument.querySelector(".probe")!;
  await until(() => htmlFrame.contentWindow?.getComputedStyle(paragraph).color === "rgb(255, 0, 0)" || undefined);
  setColor("#0000ff");
  await until(() => htmlFrame.contentWindow?.getComputedStyle(paragraph).color === "rgb(0, 0, 255)" || undefined);
  check(htmlFrame.contentDocument === htmlDocument && htmlDocument.querySelector(".probe") === paragraph, "HTML 模板更新重建文档或内容");
  check(paragraph.textContent === "Canvas regression", "HTML 模板内容解析失败");
  reports.push("PASS：主体字体颜色、HTML head 样式与模板原位更新");

  const svg = htmlDocument.querySelector("svg")!;
  const use = htmlDocument.querySelector("use")!;
  const xlink = "http://www.w3.org/1999/xlink";
  for (const [href, width] of [["#shape", 10], ["#wide", 20], ["", 0]] as const) {
    setSvgHref(href);
    await until(() => use.getAttributeNS(xlink, "href") === (href || null) && use.getBBox().width === width || undefined);
    check(use.href.baseVal === href, "SVG 链接未被浏览器识别");
    check(htmlDocument.querySelector("svg") === svg && htmlDocument.querySelector("use") === use, "SVG 更新重建节点");
    check(!use.hasAttributeNS(null, "xlink:href"), "SVG 属性丢失命名空间");
  }
  reports.push("PASS：SVG xlink:href 新增、修改、删除保留命名空间和节点，图形宽度同步");

  type(input("Image URL"), `${src}?updated`);
  await until(() => image.src === `${src}?updated` && image.complete && image.naturalWidth > 0 && loads > 0 || undefined);
  check(frame.contentDocument === frameDocument && frameDocument.querySelector("img") === image, "更新图片 URL 重建文档或节点");
  reports.push("PASS：修改 src 后正常加载新图片");
  host.querySelector<HTMLButtonElement>('button[aria-label="Preview"]')!.click();
  const preview = await until(() => {
    const node = host.querySelector<HTMLIFrameElement>(".ree-preview-frame");
    const previewImage = node?.contentDocument?.querySelector("img");
    return node && previewImage?.complete && previewImage.naturalWidth > 0 ? node : undefined;
  });
  await until(() => host.querySelector(".ree-stage-content")?.getAttribute("aria-busy") === "false" || undefined);
  host.querySelector<HTMLButtonElement>('button[aria-label="Edit"]')!.click();
  type(link, "https://example.com/after-preview");
  await until(() => image.closest("a")?.getAttribute("href") === "https://example.com/after-preview" || undefined);
  await new Promise<void>((resolve) => setTimeout(resolve, 2300));
  check(host.querySelectorAll(".ree-preview-frame").length === 1 && host.querySelector(".ree-preview-frame") === preview, "返回编辑后隐藏预览创建了新 iframe");
  host.querySelector<HTMLButtonElement>('button[aria-label="Preview"]')!.click();
  await until(() => {
    const stage = host.querySelector('.ree-preview-stage:not(.is-buffered)');
    return stage?.querySelector<HTMLIFrameElement>("iframe")?.contentDocument?.querySelector("img")?.closest("a")?.getAttribute("href") === "https://example.com/after-preview" || undefined;
  });
  reports.push("PASS：进入 Preview 加载最新内容，返回编辑不加载新预览，再次预览显示最新链接");
  frame.removeEventListener("load", onLoad);
  image.removeEventListener("load", onLoad);
  result.textContent = `${reports.join("\n")}\n全部通过`;
  result.dataset.status = "passed";
}

run().catch((error: unknown) => {
  result.textContent += `\nFAIL: ${error instanceof Error ? error.message : String(error)}`;
  result.dataset.status = "failed";
});
