import { decodeHtmlText } from "../utils/html";

/** 先保护富文本中的模板表达式，避免 HTML 解析或转义改写其语法。 */
export function protectTemplateTokens(html: string) {
  // 仅在模板内解码实体，普通正文仍走正常的 HTML 转义路径。
  let prefix = "REE_TEMPLATE_TOKEN_";
  while (html.includes(prefix)) prefix += "_";
  const tokens: string[] = [];
  let protectedHtml = "";
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf("{{", cursor);
    if (start < 0) break;
    let quote = "";
    let comment = false;
    let escaped = false;
    let end = start + 2;
    for (; end < html.length - 1; end += 1) {
      const entity = html[end] === "&" ? /^&(?:#x[\da-f]+|#\d+|quot|apos);/i.exec(html.slice(end))?.[0] : undefined;
      const char = decodeHtmlText(entity ?? html[end]);
      if (comment) {
        if (html.startsWith("*/", end)) { comment = false; end += 1; }
      } else if (quote) {
        if (escaped) escaped = false;
        else if (char === "\\" && quote !== "`") escaped = true;
        else if (char === quote) quote = "";
      } else if (html.startsWith("/*", end)) {
        comment = true;
        end += 1;
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char;
      } else if (html.startsWith("}}", end)) {
        break;
      }
      if (entity) end += entity.length - 1;
    }
    if (end >= html.length - 1) break;
    protectedHtml += html.slice(cursor, start) + `${prefix}${tokens.length}_END`;
    tokens.push(decodeHtmlText(html.slice(start, end + 2)));
    cursor = end + 2;
  }
  protectedHtml += html.slice(cursor);
  return {
    html: protectedHtml,
    restore: (value: string) => value.replace(new RegExp(`${prefix}(\\d+)_END`, "g"), (token, index: string) => tokens[Number(index)] ?? token),
  };
}
