import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { ICON_DIVIDER } from "./icons";
import { PADDING } from "./style-fields";

export const dividerBlock: BlockDefinition = {
  type: "divider",
  title: "Divider",
  icon: ICON_DIVIDER,
  description: "Horizontal divider line",
  fields: [{ type: "color", name: "color", label: "Color", defaultValue: "#e3e3e5" }],
  defaultStyle: { dimension: { padding: "12px" } },
  styleFields: [PADDING],
  render: ({ fields }) => {
    const color = String(fields.color ?? "#e3e3e5");
    return `<hr style="border:0;border-top:1px solid ${esc(color)};margin:0;" />`;
  },
};
