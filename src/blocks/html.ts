import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { htmlContent } from "../render/html-content";
import { ICON_HTML } from "./icons";
import { COMMON_STYLE_FIELDS, TYPOGRAPHY_FIELDS } from "./style-fields";

export const htmlBlock: BlockDefinition = {
  type: BLOCK_TYPES.html,
  title: "HTML",
  icon: ICON_HTML,
  description: "Paste raw HTML",
  fields: [
    {
      type: "html",
      name: "html",
      label: "HTML",
      defaultValue: '<p>Custom HTML block</p>',
      rows: 10,
      placeholder: "Paste raw HTML…",
    },
  ],
  defaultStyle: { dimension: { padding: "8px" } },
  styleFields: [...COMMON_STYLE_FIELDS, ...TYPOGRAPHY_FIELDS],
  render: ({ fields, style, global, block }) => htmlContent(String(fields.html ?? ""), style, global, block.id),
};
