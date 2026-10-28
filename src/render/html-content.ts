import type { EmailBodySettings } from "../types/document";
import { typographyCss } from "../utils/style";

/** HTML 区块保留作者的显式 inline style；head 中的 style 交给文档 head。 */
export function htmlContent(html: string, settings: EmailBodySettings, id: string): string {
  const scope = `ree-html-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const body = html.match(/<body\b([^>]*)>([\s\S]*?)<\/body\s*>/i);
  let marker = "";
  let inner = html;
  if (body) {
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? "";
    const styles = head.match(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi)?.join("\n") ?? "";
    marker = styles ? `<!--ree-head-->${styles}<!--/ree-head-->` : "";
    inner = `<div${body[1]}>${body[2]}</div>`;
  }
  return `${marker}<div class="${scope}" style="display:flow-root;${typographyCss(undefined, settings)};">${inner}</div>`;
}
