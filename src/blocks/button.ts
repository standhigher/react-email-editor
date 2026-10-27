import { BUTTON_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { styleToCss } from "../utils/style";
import { pixelLength, renderAligned } from "../render/align";
import { buttonContent, buttonStyles } from "../render/button";
import { buttonInlineHtml } from "../render/button-content";
import { ICON_BUTTON } from "./icons";
import { WRAPPER_STYLE_FIELDS } from "./style-fields";
import { BUTTON_BOX_DEFAULTS, BUTTON_STYLE_FIELDS } from "./element-fields";

export const buttonBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: BUTTON_SECTIONS,
  type: BLOCK_TYPES.button, title: "Button", icon: ICON_BUTTON, description: "Clickable CTA button",
  inlineEdit: true,
  inlineEditProfile: "button",
  defaultFields: { html: '<p><span style="font-size:16px;color:#ffffff">Buy now</span></p>' },
  fields: [
    { type: "url", name: "href", label: "Link", defaultValue: "", placeholder: "https://example.com" },
  ],
  defaultStyle: {
    element: { ...BUTTON_BOX_DEFAULTS },
  },
  styleFields: [...WRAPPER_STYLE_FIELDS, ...BUTTON_STYLE_FIELDS],
  render: ({ block, global }) => {
    const { element, width, text, box } = buttonStyles(block, global);
    const px = pixelLength(width);
    const href = String(block.fields.href ?? "").trim();
    const tag = href ? "a" : "span";
    const anchor = `<${tag}${href ? ` href="${esc(href)}"` : ""} style="display:block;text-decoration:none;${styleToCss(text)};">${buttonInlineHtml(buttonContent(block))}</${tag}>`;
    const cell = `<td align="center"${px ? ` width="${px}"` : ""} style="${styleToCss(box)};">${anchor}</td>`;
    return renderAligned("button", { align: element.align, width, content: cell });
  },
};
