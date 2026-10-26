import { cssLength } from "../utils/css-values";
import { esc } from "../utils/html";
import { pixelLength } from "./align";

/** Outlook 会丢掉空 div 的高度；用带 height 和文字的单元格撑开。 */
export function spacerHtml(height: unknown, fallback = "0px"): string {
  const css = cssLength(height, fallback);
  const px = pixelLength(css) ?? "0";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${esc(px)}" style="height:${esc(css)};line-height:${esc(css)};font-size:${esc(css)};">&nbsp;</td></tr></table>`;
}
