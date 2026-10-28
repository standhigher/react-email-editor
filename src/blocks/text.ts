import { TEXT_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { defineBlock } from "../plugins/define-block";
import { EmailControls } from "../plugins/controls";
import { typographyCss } from "../utils/style";
import { ICON_TEXT } from "./icons";
import { WRAPPER_STYLE_CONTROLS } from "./style-controls";
import { styleRichText } from "../render/content-style";

export const textBlock = defineBlock({
  containerStyles: false,
  inspectorSections: TEXT_SECTIONS,
  type: BLOCK_TYPES.text,
  title: "Text",
  icon: ICON_TEXT,
  description: "Paragraph of body text",
  controls: { html: EmailControls.richText({ label: "Content", defaultValue: "<p>Type your paragraph here…</p>", inline: true, profile: "text" }), },
  defaultStyle: {
    dimension: { padding: "16px" },
  },
  styleControls: WRAPPER_STYLE_CONTROLS,
  renderEmail: ({ controls, body }) =>
    `<div style="display:flow-root;${typographyCss(undefined, body)}">${styleRichText(String(controls.html ?? ""), undefined, body)}</div>`,
});
