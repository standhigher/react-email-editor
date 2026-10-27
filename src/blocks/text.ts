import { TEXT_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { typographyCss } from "../utils/style";
import { ICON_TEXT } from "./icons";
import { WRAPPER_STYLE_FIELDS } from "./style-fields";
import { styleRichText } from "../render/content-style";

export const textBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: TEXT_SECTIONS,
  type: BLOCK_TYPES.text,
  title: "Text",
  icon: ICON_TEXT,
  description: "Paragraph of body text",
  inlineEdit: true,
  inlineEditProfile: "text",
  defaultFields: { html: "<p>Type your paragraph here…</p>" },
  defaultStyle: {
    dimension: { padding: "16px" },
  },
  styleFields: WRAPPER_STYLE_FIELDS,
  render: ({ fields, global }) =>
    `<div style="display:flow-root;${typographyCss(undefined, global)}">${styleRichText(String(fields.html ?? ""), undefined, global)}</div>`,
};
