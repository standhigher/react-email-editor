import { TEXT_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { createBlockPlugin } from "../plugins/create-block-plugin";
import { EmailControls } from "../plugins/controls";
import { typographyCss } from "../utils/style";
import { ICON_TEXT } from "./icons";
import { styleRichText } from "../render/content-style";

export const textBlock = createBlockPlugin({
  inspectorSections: TEXT_SECTIONS,
  type: BLOCK_TYPES.text,
  title: "Text",
  icon: ICON_TEXT,
  description: "Paragraph of body text",
  controls: { html: EmailControls.richText({ label: "Content", defaultValue: "<p>Type your paragraph here…</p>", inline: true, profile: "text" }), },
  defaultStyle: {
    dimension: { padding: "16px" },
  },
  renderEmail: ({ controls, body }) =>
    `<div style="display:flow-root;${typographyCss(undefined, body)}">${styleRichText(String(controls.html ?? ""), undefined, body)}</div>`,
});
