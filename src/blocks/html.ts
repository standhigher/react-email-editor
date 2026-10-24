import type { BlockDefinition } from "../types/block";
import { ICON_HTML } from "./icons";
import { BG_COLOR, PADDING } from "./style-fields";

export const htmlBlock: BlockDefinition = {
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
};
