import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { typographyCss } from "../utils/style";
import { ICON_HEADING } from "./icons";
import { COMMON_STYLE_FIELDS, TYPOGRAPHY_FIELDS } from "./style-fields";
import { styleRichText } from "../render/content-style";

export const headingBlock: BlockDefinition = {
  type: BLOCK_TYPES.heading,
  title: "Heading",
  icon: ICON_HEADING,
  description: "Large section heading",
  inlineEdit: true,
  defaultFields: { html: "<p>Heading</p>" },
  defaultStyle: {
    dimension: { padding: "16px" },
    typography: {
      fontSize: "26px",
      fontWeight: "bold",
      lineHeight: "1.25",
    },
  },
  styleFields: [...COMMON_STYLE_FIELDS, ...TYPOGRAPHY_FIELDS],
  render: ({ fields, style, global }) =>
    `<div style="display:flow-root;${typographyCss(style, global)}">${styleRichText(String(fields.html ?? ""), style, global)}</div>`,
};
