import { esc } from "../utils/html";

export type HorizontalAlign = "left" | "center" | "right";

/** 图片、按钮、分割线的对齐方式不同，不能共用同一种定位。 */
export type AlignTarget = "image" | "button" | "divider";

interface AlignFrameOptions {
  align: unknown;
  /** 已归一化的 CSS 宽度。图片和按钮可以是 auto。 */
  width?: string;
  content: string;
}

export function readAlign(value: unknown, fallback: HorizontalAlign = "center"): HorizontalAlign {
  return value === "left" || value === "right" || value === "center" ? value : fallback;
}

/** 邮件宽度属性只接受 px 和 %。 */
export function htmlLength(value: string): string | undefined {
  const px = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());
  if (px) return String(Math.round(Number(px[1])));
  const percent = /^(\d+(?:\.\d+)?)%$/.exec(value.trim());
  if (percent) return `${Math.round(Number(percent[1]))}%`;
  return undefined;
}

export function pixelLength(value: string): string | undefined {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());
  return match ? String(Math.round(Number(match[1]))) : undefined;
}

interface ImageBox {
  /** 有明确宽度时图片用块级填满对齐表；auto 保持行内，才能被单元格 align 推动。 */
  display?: "block";
  width: string;
  frame: "table" | "inline";
}

export function imageBox(width: string): ImageBox {
  if (width !== "auto" && htmlLength(width)) return { display: "block", width: "100%", frame: "table" };
  return { width: "auto", frame: "inline" };
}

function fullWidthRow(align: HorizontalAlign, content: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${align}" style="text-align:${align};">${content}</td></tr></table>`;
}

/** Outlook 认表格 align 和 width，不认块级元素的 margin。 */
function shrinkTable(align: HorizontalAlign, width: string, content: string): string {
  const attr = htmlLength(width);
  const widthAttr = attr ? ` width="${esc(attr)}"` : "";
  return `<table role="presentation" align="${align}"${widthAttr} cellpadding="0" cellspacing="0" border="0" style="width:${esc(width)};max-width:100%;"><tr>${content}</tr></table>`;
}

function renderImage(align: HorizontalAlign, width: string, content: string): string {
  if (imageBox(width).frame === "table") return fullWidthRow(align, shrinkTable(align, width, `<td>${content}</td>`));
  return fullWidthRow(align, content);
}

function renderShrinkElement(align: HorizontalAlign, width: string, content: string): string {
  const table = width === "auto" ? `<table role="presentation" align="${align}" cellpadding="0" cellspacing="0" border="0"><tr>${content}</tr></table>` : shrinkTable(align, width, content);
  return fullWidthRow(align, table);
}

export function renderAligned(target: AlignTarget, options: AlignFrameOptions): string {
  const align = readAlign(options.align);
  const width = options.width ?? (target === "divider" ? "100%" : "auto");
  if (target === "image") return renderImage(align, width, options.content);
  return renderShrinkElement(align, width, options.content);
}
