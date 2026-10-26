import type { BlockDefinition } from "../types/block";
import { spacerHtml } from "../render/spacer";
import { ICON_SPACER } from "./icons";
import { COMMON_STYLE_FIELDS } from "./style-fields";

export const spacerBlock: BlockDefinition = {
  type: "spacer", title: "Spacer", icon: ICON_SPACER, description: "Vertical whitespace",
  fields: [{ type: "number", name: "height", label: "Height", defaultValue: 16, min: 0, max: 240, step: 1 }],
  styleFields: COMMON_STYLE_FIELDS,
  render: ({ fields }) => spacerHtml(fields.height, "16px"),
};
