import { DIVIDER_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { defineBlock } from "../plugins/define-block";
import { cssBorderStyle, cssColor, cssLength } from "../utils/css-values";
import { esc } from "../utils/html";
import { renderAligned } from "../render/align";
import { ICON_DIVIDER } from "./icons";
import { WRAPPER_STYLE_CONTROLS } from "./style-controls";
import { DIVIDER_STYLE_CONTROLS } from "./element-controls";

export const dividerBlock = defineBlock({
  containerStyles: false,
  inspectorSections: DIVIDER_SECTIONS,
  type: BLOCK_TYPES.divider, title: "Divider", icon: ICON_DIVIDER, description: "Horizontal divider line",
  defaultStyle: { dimension: { padding: "12px" }, element: { borderColor: "#e3e3e5" } },
  styleControls: [...WRAPPER_STYLE_CONTROLS.filter((control) => !control.id.startsWith("decorations.border")), ...DIVIDER_STYLE_CONTROLS, { id: "element.borderColor", group: "decorations", label: "Line", control: "color", defaultValue: "#e3e3e5" }],
  renderEmail: ({ style }) => {
    const element = style.element ?? {};
    const width = cssLength(element.width, "100%");
    const border = `${cssLength(element.borderWidth, "1px")} ${cssBorderStyle(element.borderStyle)} ${cssColor(element.borderColor, "#e3e3e5")}`;
    const cell = `<td style="border-top:${esc(border)};font-size:1px;line-height:1px;">&nbsp;</td>`;
    return renderAligned("divider", { align: element.align, width, content: cell });
  },
});
