import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { typographyCss } from "../utils/style";
import { ICON_TEXT } from "./icons";
import { COMMON_STYLE_FIELDS, RICH_TEXT_STYLE_FIELDS } from "./style-fields";
import { styleRichText } from "../render/content-style";

export const textBlock: BlockDefinition = {
  type: BLOCK_TYPES.text,
  title: "Text",
  icon: ICON_TEXT,
  description: "Paragraph of body text",
  inlineEdit: true,
  defaultFields: { html: "<p>Type your paragraph here…</p>" },
  defaultStyle: {
    dimension: { padding: "16px" },
  },
  styleFields: [...COMMON_STYLE_FIELDS, ...RICH_TEXT_STYLE_FIELDS],
  render: ({ fields, style, global }) =>
    `<div style="display:flow-root;${typographyCss(style, global)}">${styleRichText(String(fields.html ?? ""), style, global)}</div>`,
};
