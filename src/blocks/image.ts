import { IMAGE_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { cssLength } from "../utils/css-values";
import { decorationStyle, styleToCss } from "../utils/style";
import { imageBox, pixelLength, renderAligned } from "../render/align";
import { ICON_IMAGE } from "./icons";
import { WRAPPER_STYLE_FIELDS } from "./style-fields";
import { ELEMENT_ALIGN, IMAGE_STYLE_FIELDS } from "./element-fields";

export const imageBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: IMAGE_SECTIONS,
  type: BLOCK_TYPES.image, title: "Image", icon: ICON_IMAGE, description: "Insert an image",
  fields: [
    { type: "url", name: "src", label: "Image URL", defaultValue: "https://placehold.co/560x200?text=Image" },
    { type: "text", name: "alt", label: "Alt text", defaultValue: "Image" },
    { type: "url", name: "link", label: "Link", defaultValue: "" },
  ],
  defaultStyle: { dimension: { padding: "8px" } },
  styleFields: [...WRAPPER_STYLE_FIELDS, ELEMENT_ALIGN, ...IMAGE_STYLE_FIELDS],
  render: ({ fields, style }) => {
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
    const image = `<img src="${esc(String(fields.src ?? ""))}" alt="${esc(String(fields.alt ?? ""))}"${widthAttr ? ` width="${widthAttr}"` : ""}${heightAttr ? ` height="${heightAttr}"` : ""} border="0" style="outline:none;text-decoration:none;${css};" />`;
    const link = String(fields.link ?? "");
    const content = link ? `<a href="${esc(link)}" style="text-decoration:none;${box.display === "block" ? "display:block;" : ""}">${image}</a>` : image;
    return renderAligned("image", { align: element.align, width, content });
  },
};
