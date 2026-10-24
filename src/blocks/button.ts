import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { ICON_BUTTON } from "./icons";
import { BG_COLOR, BORDER_RADIUS, FONT_SIZE, PADDING, TEXT_COLOR } from "./style-fields";

export const buttonBlock: BlockDefinition = {
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
    const background = style.decorations?.backgroundColor ?? "#005bd3";
    const color = style.typography?.color ?? "#ffffff";
    const radius = style.decorations?.borderRadius ?? "8px";
    const fontSize = style.typography?.fontSize ?? "16px";
    const backgroundValue = variant === "outline" ? "transparent" : background;
    const colorValue = variant === "outline" ? background : color;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><a href="${esc(href)}" style="display:inline-block;background-color:${esc(backgroundValue)};color:${esc(colorValue)};font-size:${esc(fontSize)};font-family:Arial,Helvetica,sans-serif;text-decoration:none;padding:12px 32px;border-radius:${esc(radius)};border:1px solid ${esc(background)};">${esc(label)}</a></td></tr></table>`;
  },
};
