import type { BlockDefinition } from "../types/block";
import { typographyCss } from "../utils/style";
import { ICON_HEADING } from "./icons";
import {
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  PADDING,
  TEXT_COLOR,
} from "./style-fields";

export const headingBlock: BlockDefinition = {
  type: "heading",
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
  styleFields: [FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, TEXT_COLOR, PADDING],
  render: ({ fields, style, global }) =>
    `<div style="${typographyCss(style, global)}">${String(fields.html ?? "")}</div>`,
};
