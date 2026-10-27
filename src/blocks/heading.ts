import { HEADING_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { typographyCss } from "../utils/style";
import { ICON_HEADING } from "./icons";
import { WRAPPER_STYLE_FIELDS } from "./style-fields";
import { styleRichText } from "../render/content-style";

export const headingBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: HEADING_SECTIONS,
  type: BLOCK_TYPES.heading,
  title: "Heading",
  icon: ICON_HEADING,
  description: "Large section heading",
  inlineEdit: true,
  inlineEditProfile: "heading",
  defaultFields: { html: '<p style="line-height:1.25"><span style="font-size:26px"><strong>Heading</strong></span></p>' },
  defaultStyle: {
    dimension: { padding: "16px" },
  },
  styleFields: WRAPPER_STYLE_FIELDS,
  render: ({ fields, global }) =>
    `<div style="display:flow-root;${typographyCss(undefined, global)}">${styleRichText(String(fields.html ?? ""), undefined, global)}</div>`,
};
