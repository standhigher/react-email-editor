import { ButtonCanvas } from "./ButtonCanvas";
import { safeEmailUrl } from "../plugins/email-tools";
import { BUTTON_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { defineBlock } from "../plugins/define-block";
import { EmailControls } from "../plugins/controls";
import { esc } from "../utils/html";
import { styleToCss } from "../utils/style";
import { pixelLength, renderAligned } from "../render/align";
import { buttonContent, buttonStyles } from "../render/button";
import { buttonInlineHtml } from "../render/button-content";
import { ICON_BUTTON } from "./icons";
import { WRAPPER_STYLE_CONTROLS } from "./style-controls";
import { BUTTON_BOX_DEFAULTS, BUTTON_STYLE_CONTROLS } from "./element-controls";

export const buttonBlock = defineBlock({
  containerStyles: false,
  Canvas: ButtonCanvas,
  inspectorSections: BUTTON_SECTIONS,
  type: BLOCK_TYPES.button, title: "Button", icon: ICON_BUTTON, description: "Clickable CTA button",
  controls: {
    html: EmailControls.richText({ label: "Content", defaultValue: '<p><span style="font-size:16px;color:#ffffff">Buy now</span></p>', inline: true, profile: "button" }),
    href: EmailControls.url({ label: "Link", placeholder: "https://example.com" }),
  },
  defaultStyle: {
    element: { ...BUTTON_BOX_DEFAULTS },
  },
  styleControls: [...WRAPPER_STYLE_CONTROLS, ...BUTTON_STYLE_CONTROLS],
  renderEmail: ({ block, body }) => {
    const { element, width, text, box } = buttonStyles(block, body);
    const px = pixelLength(width);
    const href = safeEmailUrl(String(block.controls.href ?? ""));
    const tag = href ? "a" : "span";
    const anchor = `<${tag}${href ? ` href="${esc(href)}"` : ""} style="display:block;text-decoration:none;${styleToCss(text)};">${buttonInlineHtml(buttonContent(block))}</${tag}>`;
    const cell = `<td align="center"${px ? ` width="${px}"` : ""} style="${styleToCss(box)};">${anchor}</td>`;
    return renderAligned("button", { align: element.align, width, content: cell });
  },
});
