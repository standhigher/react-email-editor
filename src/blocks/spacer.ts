import type { BlockDefinition } from "../types/block";
import { esc } from "../utils/html";
import { ICON_SPACER } from "./icons";

export const spacerBlock: BlockDefinition = {
  type: "spacer",
  title: "Spacer",
  icon: ICON_SPACER,
  description: "Vertical whitespace",
  fields: [{ type: "number", name: "height", label: "Height (px)", defaultValue: 16 }],
  render: ({ fields }) => {
    const height = String(fields.height ?? "16");
    return `<div style="height:${esc(height)}px;line-height:${esc(height)}px;font-size:0;">&nbsp;</div>`;
  },
};
