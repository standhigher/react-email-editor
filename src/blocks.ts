import type {
  BlockDefinition,
  EmailBlockStyle,
  StyleFieldConfig,
} from "./types";

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function typographyCss(style: EmailBlockStyle | undefined): string {
  const t = style?.typography ?? {};
  const parts: string[] = ["font-family:Arial,Helvetica,sans-serif"];
  if (t.fontSize) parts.push(`font-size:${t.fontSize}`);
  if (t.fontWeight) parts.push(`font-weight:${t.fontWeight}`);
  if (t.lineHeight) parts.push(`line-height:${t.lineHeight}`);
  if (t.color) parts.push(`color:${t.color}`);
  if (t.textAlign) parts.push(`text-align:${t.textAlign}`);
  return parts.join(";");
}

/** 区块外层 cell 的样式（padding + 背景），用于邮件输出。 */
export function blockCellCss(style: EmailBlockStyle | undefined): string {
  const s = style ?? {};
  const padding = s.dimension?.padding ?? "0";
  const background = s.decorations?.backgroundColor ?? "transparent";
  return `padding:${esc(padding)};background-color:${esc(background)};`;
}

// 通用样式字段（供各区块声明自己暴露哪些）
const PADDING: StyleFieldConfig = {
  id: "dimension.padding",
  group: "dimension",
  label: "内边距",
  control: "text",
};
const FONT_SIZE: StyleFieldConfig = {
  id: "typography.fontSize",
  group: "typography",
  label: "字号",
  control: "text",
};
const FONT_WEIGHT: StyleFieldConfig = {
  id: "typography.fontWeight",
  group: "typography",
  label: "字重",
  control: "select",
  options: [
    { label: "常规", value: "normal" },
    { label: "加粗", value: "bold" },
  ],
};
const LINE_HEIGHT: StyleFieldConfig = {
  id: "typography.lineHeight",
  group: "typography",
  label: "行高",
  control: "text",
};
const TEXT_COLOR: StyleFieldConfig = {
  id: "typography.color",
  group: "typography",
  label: "文字颜色",
  control: "color",
};
const TEXT_ALIGN: StyleFieldConfig = {
  id: "typography.textAlign",
  group: "typography",
  label: "对齐",
  control: "alignment",
};
const BG_COLOR: StyleFieldConfig = {
  id: "decorations.backgroundColor",
  group: "decorations",
  label: "背景色",
  control: "color",
};
const BORDER_RADIUS: StyleFieldConfig = {
  id: "decorations.borderRadius",
  group: "decorations",
  label: "圆角",
  control: "text",
};

const ICON_TEXT =
  '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 4h14v3H5V4Zm0 13h9v-3H5v3Z"/></svg>';
const ICON_HEADING =
  '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 4h3v7h10V4h3v16h-3v-6H7v6H4V4Z"/></svg>';
const ICON_BUTTON =
  '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="7" width="18" height="10" rx="2" fill="currentColor"/></svg>';
const ICON_IMAGE =
  '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.5 11 4-4 3 3 2.5-2.5 4 4V6.5h-13V16Z"/></svg>';
const ICON_DIVIDER =
  '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 11h18v2H3v-2Z"/></svg>';
const ICON_SPACER =
  '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 8h16v2H4V8Zm0 6h16v2H4v-2Z"/></svg>';
const ICON_HTML =
  '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 3l-3 9 3 9h3l-3-9 3-9H5Zm6 0 3 9-3 9h3l3-9-3-9h-3Zm6 0-3 9 3 9h3l-3-9 3-9h-3Z"/></svg>';

export const DEFAULT_BLOCKS: BlockDefinition[] = [
  {
    type: "heading",
    title: "标题",
    icon: ICON_HEADING,
    description: "大号标题文字",
    inlineEdit: true,
    defaultFields: { html: "<p>标题文字</p>" },
    defaultStyle: {
      typography: {
        fontSize: "26px",
        fontWeight: "bold",
        color: "#1a1a1a",
        textAlign: "left",
      },
    },
    styleFields: [FONT_SIZE, FONT_WEIGHT, TEXT_COLOR, TEXT_ALIGN, PADDING],
    render: ({ fields, style }) =>
      `<div style="${typographyCss(style)}">${String(fields.html ?? "")}</div>`,
  },
  {
    type: "text",
    title: "文本",
    icon: ICON_TEXT,
    description: "正文段落",
    inlineEdit: true,
    defaultFields: { html: "<p>在这里输入正文内容…</p>" },
    defaultStyle: {
      typography: {
        fontSize: "15px",
        lineHeight: "1.6",
        color: "#333333",
        textAlign: "left",
      },
    },
    styleFields: [FONT_SIZE, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN, PADDING],
    render: ({ fields, style }) =>
      `<div style="${typographyCss(style)}">${String(fields.html ?? "")}</div>`,
  },
  {
    type: "button",
    title: "按钮",
    icon: ICON_BUTTON,
    description: "可点击的 CTA 按钮",
    fields: [
      { type: "text", name: "label", label: "文案", defaultValue: "立即购买" },
      { type: "url", name: "href", label: "链接", defaultValue: "https://example.com" },
      {
        type: "select",
        name: "variant",
        label: "样式",
        defaultValue: "filled",
        options: [
          { label: "实心", value: "filled" },
          { label: "描边", value: "outline" },
        ],
      },
    ],
    defaultStyle: {
      typography: { fontSize: "16px", color: "#ffffff", textAlign: "center" },
      decorations: { backgroundColor: "#005bd3", borderRadius: "4px" },
    },
    styleFields: [FONT_SIZE, TEXT_COLOR, BG_COLOR, BORDER_RADIUS, PADDING],
    render: ({ fields, style }) => {
      const label = String(fields.label ?? "按钮");
      const href = String(fields.href ?? "#");
      const variant = String(fields.variant ?? "filled");
      const bg = style.decorations?.backgroundColor ?? "#005bd3";
      const color = style.typography?.color ?? "#ffffff";
      const radius = style.decorations?.borderRadius ?? "4px";
      const fontSize = style.typography?.fontSize ?? "16px";
      const bgVal = variant === "outline" ? "transparent" : bg;
      const colorVal = variant === "outline" ? bg : color;
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><a href="${esc(href)}" style="display:inline-block;background-color:${esc(bgVal)};color:${esc(colorVal)};font-size:${esc(fontSize)};font-family:Arial,Helvetica,sans-serif;text-decoration:none;padding:12px 32px;border-radius:${esc(radius)};border:1px solid ${esc(bg)};">${esc(label)}</a></td></tr></table>`;
    },
  },
  {
    type: "image",
    title: "图片",
    icon: ICON_IMAGE,
    description: "插入图片",
    fields: [
      {
        type: "url",
        name: "src",
        label: "图片地址",
        defaultValue: "https://placehold.co/560x200?text=Image",
      },
      { type: "text", name: "alt", label: "替代文本", defaultValue: "图片" },
      { type: "url", name: "link", label: "点击链接", defaultValue: "" },
      {
        type: "select",
        name: "align",
        label: "对齐",
        defaultValue: "center",
        options: [
          { label: "左", value: "left" },
          { label: "中", value: "center" },
          { label: "右", value: "right" },
        ],
      },
    ],
    defaultStyle: { dimension: { padding: "8px 0" } },
    styleFields: [PADDING],
    render: ({ fields }) => {
      const src = String(fields.src ?? "");
      const alt = String(fields.alt ?? "");
      const align = String(fields.align ?? "center");
      const link = String(fields.link ?? "");
      const img = `<img src="${esc(src)}" alt="${esc(alt)}" style="max-width:100%;display:block;border:0;outline:none;text-decoration:none;" />`;
      const content = link
        ? `<a href="${esc(link)}" style="text-decoration:none;">${img}</a>`
        : img;
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${esc(align)}">${content}</td></tr></table>`;
    },
  },
  {
    type: "divider",
    title: "分割线",
    icon: ICON_DIVIDER,
    description: "水平分割线",
    fields: [
      { type: "color", name: "color", label: "颜色", defaultValue: "#e3e3e3" },
    ],
    defaultStyle: { dimension: { padding: "12px 0" } },
    styleFields: [PADDING],
    render: ({ fields }) => {
      const color = String(fields.color ?? "#e3e3e3");
      return `<hr style="border:0;border-top:1px solid ${esc(color)};margin:0;" />`;
    },
  },
  {
    type: "spacer",
    title: "间隔",
    icon: ICON_SPACER,
    description: "垂直留白",
    fields: [
      { type: "number", name: "height", label: "高度(px)", defaultValue: 16 },
    ],
    render: ({ fields }) => {
      const height = String(fields.height ?? "16");
      return `<div style="height:${esc(height)}px;line-height:${esc(height)}px;font-size:0;">&nbsp;</div>`;
    },
  },
  {
    type: "html",
    title: "HTML 代码",
    icon: ICON_HTML,
    description: "粘贴任意 HTML",
    fields: [
      {
        type: "html",
        name: "html",
        label: "HTML 代码",
        defaultValue: '<p style="margin:0;">自定义 HTML 区块</p>',
        rows: 10,
        placeholder: "粘贴任意 HTML…",
      },
    ],
    defaultStyle: { dimension: { padding: "8px 0" } },
    styleFields: [PADDING, BG_COLOR],
    render: ({ fields }) => String(fields.html ?? ""),
  },
];
