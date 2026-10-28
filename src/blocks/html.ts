import { HTML_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { htmlContent } from "../render/html-content";
import { ICON_HTML } from "./icons";
import { WRAPPER_STYLE_FIELDS } from "./style-fields";

export const htmlBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: HTML_SECTIONS,
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
  styleFields: WRAPPER_STYLE_FIELDS,
  render: ({ fields, body, block }) => htmlContent(String(fields.html ?? ""), body, block.id),
};
