import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { ICON_IMAGE } from "./icons";
import { PADDING } from "./style-fields";

export const imageBlock: BlockDefinition = {
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
    const image = `<img src="${esc(src)}" alt="${esc(alt)}" style="max-width:100%;display:block;border:0;outline:none;text-decoration:none;" />`;
    const content = link
      ? `<a href="${esc(link)}" style="text-decoration:none;">${image}</a>`
      : image;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${esc(align)}">${content}</td></tr></table>`;
  },
};
