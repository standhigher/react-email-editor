import { safeEmailUrl } from "../plugins/email-tools";
import { IMAGE_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { createBlockPlugin } from "../plugins/create-block-plugin";
import { EmailControls } from "../plugins/controls";
import { esc } from "../utils/html";
import { cssLength } from "../utils/css-values";
import { decorationStyle, styleToCss } from "../utils/style";
import { imageBox, pixelLength, renderAligned } from "../render/align";
import { ICON_IMAGE } from "./icons";
import { ELEMENT_ALIGN, IMAGE_STYLE_CONTROLS } from "./element-controls";

export const imageBlock = createBlockPlugin({
  inspectorSections: IMAGE_SECTIONS,
  type: BLOCK_TYPES.image, title: "Image", icon: ICON_IMAGE, description: "Insert an image",
  controls: {
    src: EmailControls.image({ label: "Image URL", defaultValue: "https://placehold.co/560x200?text=Image" }),
    link: EmailControls.url({ label: "Link", placeholder: "https://example.com" }),
  },
  defaultStyle: { dimension: { padding: "8px" } },
  styleControls: [ELEMENT_ALIGN, ...IMAGE_STYLE_CONTROLS],
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
    const image = `<img src="${esc(safeEmailUrl(String(controls.src ?? ""), true))}" alt=""${widthAttr ? ` width="${widthAttr}"` : ""}${heightAttr ? ` height="${heightAttr}"` : ""} border="0" style="outline:none;text-decoration:none;${css};" />`;
    const link = safeEmailUrl(String(controls.link ?? ""));
    const content = link ? `<a href="${esc(link)}" style="text-decoration:none;${box.display === "block" ? "display:block;" : ""}">${image}</a>` : image;
    return renderAligned("image", { align: element.align, width, content });
  },
});
