import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { cssLength, cssSpacing } from "../utils/css-values";
import { decorationStyle, styleToCss, typographyStyle } from "../utils/style";
import { pixelLength, renderAligned } from "../render/align";
import { ICON_BUTTON } from "./icons";
import { COMMON_STYLE_FIELDS } from "./style-fields";
import { BUTTON_BOX_DEFAULTS, BUTTON_STYLE_FIELDS } from "./element-fields";

export const buttonBlock: BlockDefinition = {
  type: BLOCK_TYPES.button, title: "Button", icon: ICON_BUTTON, description: "Clickable CTA button",
  fields: [
    { type: "text", name: "label", label: "Label", defaultValue: "Buy now" },
    { type: "url", name: "href", label: "Link", defaultValue: "https://example.com" },
  ],
  defaultStyle: {
    element: { fontSize: "16px", color: "#ffffff", ...BUTTON_BOX_DEFAULTS },
  },
  styleFields: [...COMMON_STYLE_FIELDS, ...BUTTON_STYLE_FIELDS],
  render: ({ fields, style, global }) => {
    const element = { ...BUTTON_BOX_DEFAULTS, ...style.element };
    const width = cssLength(element.width, "auto", true);
    const px = pixelLength(width);
    const text = styleToCss({ ...typographyStyle({ typography: element }, global), textAlign: "center" });
    const box = styleToCss({
      ...decorationStyle(element),
      padding: cssSpacing(element.padding, BUTTON_BOX_DEFAULTS.padding),
      textAlign: "center",
    });
    const anchor = `<a href="${esc(String(fields.href ?? "#"))}" style="display:block;text-decoration:none;${text};">${esc(String(fields.label ?? "Button"))}</a>`;
    const cell = `<td align="center"${px ? ` width="${px}"` : ""} style="${box};">${anchor}</td>`;
    return renderAligned("button", { align: element.align, width, content: cell });
  },
};
