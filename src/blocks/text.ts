import type { BlockDefinition } from "../types/block";
import { typographyCss } from "../utils/style";
import { ICON_TEXT } from "./icons";
import { FONT_SIZE, LINE_HEIGHT, PADDING, TEXT_ALIGN, TEXT_COLOR } from "./style-fields";

export const textBlock: BlockDefinition = {
  type: "text",
  title: "Text",
  icon: ICON_TEXT,
  description: "Paragraph of body text",
  inlineEdit: true,
  defaultFields: { html: "<p>Type your paragraph here…</p>" },
  defaultStyle: {
    dimension: { padding: "16px" },
    typography: {
      fontSize: "15px",
      lineHeight: "1.6",
      color: "#303030",
      textAlign: "left",
    },
  },
  styleFields: [FONT_SIZE, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN, PADDING],
  render: ({ fields, style }) =>
    `<div style="${typographyCss(style)}">${String(fields.html ?? "")}</div>`,
};
