import { HTML_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { createBlockPlugin } from "../plugins/create-block-plugin";
import { EmailControls } from "../plugins/controls";
import { htmlContent } from "../render/html-content";
import { ICON_HTML } from "./icons";

export const htmlBlock = createBlockPlugin({
  inspectorSections: HTML_SECTIONS,
  type: BLOCK_TYPES.html,
  title: "HTML",
  icon: ICON_HTML,
  description: "Paste raw HTML",
  controls: { html: EmailControls.html({ label: "HTML", defaultValue: "<p>Custom HTML block</p>", rows: 10, placeholder: "Paste raw HTML…" }) },
  defaultStyle: { dimension: { padding: "8px" } },
  renderEmail: ({ controls, body, block }) => htmlContent(String(controls.html ?? ""), body, block.id),
});
