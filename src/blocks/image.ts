import { safeEmailUrl } from "../plugins/email-tools";
import { IMAGE_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { defineBlock } from "../plugins/define-block";
import { EmailControls } from "../plugins/controls";
import { esc } from "../utils/html";
import { cssLength } from "../utils/css-values";
import { decorationStyle, styleToCss } from "../utils/style";
import { imageBox, pixelLength, renderAligned } from "../render/align";
import { ICON_IMAGE } from "./icons";
import { WRAPPER_STYLE_CONTROLS } from "./style-controls";
import { ELEMENT_ALIGN, IMAGE_STYLE_CONTROLS } from "./element-controls";

export const imageBlock = defineBlock({
  containerStyles: false,
  inspectorSections: IMAGE_SECTIONS,
  type: BLOCK_TYPES.image, title: "Image", icon: ICON_IMAGE, description: "Insert an image",
  controls: {
    src: EmailControls.image({ label: "Image URL", defaultValue: "https://placehold.co/560x200?text=Image" }),
    alt: EmailControls.text({ label: "Alt text", defaultValue: "Image" }),
    link: EmailControls.url({ label: "Link", placeholder: "https://example.com" }),
  },
  defaultStyle: { dimension: { padding: "8px" } },
  styleControls: [...WRAPPER_STYLE_CONTROLS, ELEMENT_ALIGN, ...IMAGE_STYLE_CONTROLS],
  renderEmail: ({ controls, style }) => {
    const element = style.element ?? {};
    const width = cssLength(element.width, "auto", true);
    const height = cssLength(element.height, "auto", true);
    const box = imageBox(width);
    const css = styleToCss({
      ...decorationStyle(element),
      display: box.display,
      width: box.width,
      height,
      maxWidth: "100%",
      verticalAlign: box.display ? undefined : "bottom",
    });
    const widthAttr = pixelLength(width);
    const heightAttr = pixelLength(height);
    const image = `<img src="${esc(safeEmailUrl(String(controls.src ?? ""), true))}" alt="${esc(String(controls.alt ?? ""))}"${widthAttr ? ` width="${widthAttr}"` : ""}${heightAttr ? ` height="${heightAttr}"` : ""} border="0" style="outline:none;text-decoration:none;${css};" />`;
    const link = safeEmailUrl(String(controls.link ?? ""));
    const content = link ? `<a href="${esc(link)}" style="text-decoration:none;${box.display === "block" ? "display:block;" : ""}">${image}</a>` : image;
    return renderAligned("image", { align: element.align, width, content });
  },
});
