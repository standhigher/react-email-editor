import { HEADING_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { createBlockPlugin } from "../plugins/create-block-plugin";
import { EmailControls } from "../plugins/controls";
import { typographyCss } from "../utils/style";
import { ICON_HEADING } from "./icons";
import { styleRichText } from "../render/content-style";

export const headingBlock = createBlockPlugin({
  inspectorSections: HEADING_SECTIONS,
  type: BLOCK_TYPES.heading,
  title: "Heading",
  icon: ICON_HEADING,
  description: "Large section heading",
  controls: { html: EmailControls.richText({ label: "Content", defaultValue: '<p style="line-height:1.25"><span style="font-size:26px"><strong>Heading</strong></span></p>', inline: true, profile: "heading" }), },
  defaultStyle: {
    dimension: { padding: "16px" },
  },
  renderEmail: ({ controls, body }) =>
    `<div style="display:flow-root;${typographyCss(undefined, body)}">${styleRichText(String(controls.html ?? ""), undefined, body)}</div>`,
});
