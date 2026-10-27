import { DIVIDER_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { cssBorderStyle, cssColor, cssLength } from "../utils/css-values";
import { esc } from "../utils/html";
import { renderAligned } from "../render/align";
import { ICON_DIVIDER } from "./icons";
import { WRAPPER_STYLE_FIELDS } from "./style-fields";
import { DIVIDER_STYLE_FIELDS } from "./element-fields";

export const dividerBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: DIVIDER_SECTIONS,
  type: BLOCK_TYPES.divider, title: "Divider", icon: ICON_DIVIDER, description: "Horizontal divider line",
  defaultStyle: { dimension: { padding: "12px" }, element: { borderColor: "#e3e3e5" } },
  styleFields: [...WRAPPER_STYLE_FIELDS.filter((field) => !field.id.startsWith("decorations.border")), ...DIVIDER_STYLE_FIELDS, { id: "element.borderColor", group: "decorations", label: "Line", control: "color", defaultValue: "#e3e3e5" }],
  render: ({ style }) => {
    const element = style.element ?? {};
    const width = cssLength(element.width, "100%");
    const border = `${cssLength(element.borderWidth, "1px")} ${cssBorderStyle(element.borderStyle)} ${cssColor(element.borderColor, "#e3e3e5")}`;
    const cell = `<td style="border-top:${esc(border)};font-size:1px;line-height:1px;">&nbsp;</td>`;
    return renderAligned("divider", { align: element.align, width, content: cell });
  },
};
