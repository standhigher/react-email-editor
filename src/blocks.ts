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

/** Block outer cell style (padding + background), used for email output. */
export function blockCellCss(style: EmailBlockStyle | undefined): string {
  const s = style ?? {};
  const padding = s.dimension?.padding ?? "0";
  const background = s.decorations?.backgroundColor ?? "transparent";
  return `padding:${esc(padding)};background-color:${esc(background)};`;
}

// Shared style fields (blocks declare which ones they expose)
const PADDING: StyleFieldConfig = {
  id: "dimension.padding",
  group: "dimension",
  label: "Padding",
  control: "range",
  unit: "px",
  min: 0,
  max: 64,
  step: 4,
};
const FONT_SIZE: StyleFieldConfig = {
  id: "typography.fontSize",
  group: "typography",
  label: "Font size",
  control: "number",
  unit: "px",
  min: 8,
  max: 72,
};
const FONT_WEIGHT: StyleFieldConfig = {
  id: "typography.fontWeight",
  group: "typography",
  label: "Weight",
  control: "select",
  options: [
    { label: "Regular", value: "normal" },
    { label: "Bold", value: "bold" },
  ],
};
const LINE_HEIGHT: StyleFieldConfig = {
  id: "typography.lineHeight",
  group: "typography",
  label: "Line height",
  control: "range",
  min: 1,
  max: 2,
  step: 0.05,
};
const TEXT_COLOR: StyleFieldConfig = {
  id: "typography.color",
  group: "typography",
  label: "Text color",
  control: "color",
};
const TEXT_ALIGN: StyleFieldConfig = {
  id: "typography.textAlign",
  group: "typography",
  label: "Align",
  control: "alignment",
};
const BG_COLOR: StyleFieldConfig = {
  id: "decorations.backgroundColor",
  group: "decorations",
  label: "Background",
  control: "color",
};
const BORDER_RADIUS: StyleFieldConfig = {
  id: "decorations.borderRadius",
  group: "decorations",
  label: "Corner radius",
  control: "range",
  unit: "px",
  min: 0,
  max: 32,
  step: 2,
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
    title: "Heading",
    icon: ICON_HEADING,
    description: "Large section heading",
    inlineEdit: true,
    defaultFields: { html: "<p>Heading</p>" },
    defaultStyle: {
      typography: {
        fontSize: "26px",
        fontWeight: "bold",
        lineHeight: "1.25",
        color: "#202223",
        textAlign: "left",
      },
    },
    styleFields: [FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN, PADDING],
    render: ({ fields, style }) =>
      `<div style="${typographyCss(style)}">${String(fields.html ?? "")}</div>`,
  },
  {
    type: "text",
    title: "Text",
    icon: ICON_TEXT,
    description: "Paragraph of body text",
    inlineEdit: true,
    defaultFields: { html: "<p>Type your paragraph here…</p>" },
    defaultStyle: {
      typography: {
        fontSize: "15px",
        lineHeight: "1.6",
        color: "#303030",
        textAlign: "left",
      },
    },
    styleFields: [FONT_SIZE, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN, PADDING],
    render: ({ fields, style }) =>
      `<div style="${typographyCss(style)}">${String(fields.html ?? "")}</div>`,
  },
  {
    type: "button",
    title: "Button",
    icon: ICON_BUTTON,
    description: "Clickable CTA button",
    fields: [
      { type: "text", name: "label", label: "Label", defaultValue: "Buy now" },
      { type: "url", name: "href", label: "Link", defaultValue: "https://example.com" },
      {
        type: "select",
        name: "variant",
        label: "Style",
        defaultValue: "filled",
        options: [
          { label: "Filled", value: "filled" },
          { label: "Outline", value: "outline" },
        ],
      },
    ],
    defaultStyle: {
      typography: { fontSize: "16px", color: "#ffffff", textAlign: "center" },
      decorations: { backgroundColor: "#005bd3", borderRadius: "8px" },
    },
    styleFields: [FONT_SIZE, TEXT_COLOR, BG_COLOR, BORDER_RADIUS, PADDING],
    render: ({ fields, style }) => {
      const label = String(fields.label ?? "Button");
      const href = String(fields.href ?? "#");
      const variant = String(fields.variant ?? "filled");
      const bg = style.decorations?.backgroundColor ?? "#005bd3";
      const color = style.typography?.color ?? "#ffffff";
      const radius = style.decorations?.borderRadius ?? "8px";
      const fontSize = style.typography?.fontSize ?? "16px";
      const bgVal = variant === "outline" ? "transparent" : bg;
      const colorVal = variant === "outline" ? bg : color;
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><a href="${esc(href)}" style="display:inline-block;background-color:${esc(bgVal)};color:${esc(colorVal)};font-size:${esc(fontSize)};font-family:Arial,Helvetica,sans-serif;text-decoration:none;padding:12px 32px;border-radius:${esc(radius)};border:1px solid ${esc(bg)};">${esc(label)}</a></td></tr></table>`;
    },
  },
  {
    type: "image",
    title: "Image",
    icon: ICON_IMAGE,
    description: "Insert an image",
    fields: [
      {
        type: "url",
        name: "src",
        label: "Image URL",
        defaultValue: "https://placehold.co/560x200?text=Image",
      },
      { type: "text", name: "alt", label: "Alt text", defaultValue: "Image" },
      { type: "url", name: "link", label: "Link", defaultValue: "" },
      {
        type: "select",
        name: "align",
        label: "Align",
        defaultValue: "center",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    defaultStyle: { dimension: { padding: "8px" } },
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
    title: "Divider",
    icon: ICON_DIVIDER,
    description: "Horizontal divider line",
    fields: [
      { type: "color", name: "color", label: "Color", defaultValue: "#e3e3e5" },
    ],
    defaultStyle: { dimension: { padding: "12px" } },
    styleFields: [PADDING],
    render: ({ fields }) => {
      const color = String(fields.color ?? "#e3e3e5");
      return `<hr style="border:0;border-top:1px solid ${esc(color)};margin:0;" />`;
    },
  },
  {
    type: "spacer",
    title: "Spacer",
    icon: ICON_SPACER,
    description: "Vertical whitespace",
    fields: [
      { type: "number", name: "height", label: "Height (px)", defaultValue: 16 },
    ],
    render: ({ fields }) => {
      const height = String(fields.height ?? "16");
      return `<div style="height:${esc(height)}px;line-height:${esc(height)}px;font-size:0;">&nbsp;</div>`;
    },
  },
  {
    type: "html",
    title: "HTML",
    icon: ICON_HTML,
    description: "Paste raw HTML",
    fields: [
      {
        type: "html",
        name: "html",
        label: "HTML",
        defaultValue: '<p style="margin:0;">Custom HTML block</p>',
        rows: 10,
        placeholder: "Paste raw HTML…",
      },
    ],
    defaultStyle: { dimension: { padding: "8px" } },
    styleFields: [PADDING, BG_COLOR],
    render: ({ fields }) => String(fields.html ?? ""),
  },
];
