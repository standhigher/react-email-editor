import { parser } from "@lezer/html";
import { cssColor, cssFont, cssLength } from "../utils/css-values";
import { esc } from "../utils/html";
import { protectTemplateTokens } from "./template-tokens";

type HtmlNode = ReturnType<typeof parser.parse>["topNode"];

const INLINE_TAGS: Record<string, string> = { strong: "strong", b: "strong", em: "em", i: "em", u: "u", span: "span" };
const OMIT_CONTENT = new Set(["script", "style", "iframe", "object", "template"]);
const BLOCK_TAGS = new Set(["p", "div", "li", "br", "h1", "h2", "h3", "h4", "h5", "h6"]);

function inlineStyle(value: string): string {
  return value.split(";").flatMap((declaration) => {
    const separator = declaration.indexOf(":");
    const name = declaration.slice(0, separator).trim().toLowerCase();
    const raw = declaration.slice(separator + 1).trim();
    let normalized = "";
    if (name === "font-family") normalized = cssFont(raw, "");
    if (name === "font-size") normalized = cssLength(raw, "");
    if (name === "color") normalized = cssColor(raw, "");
    if (name === "font-weight" && /^(normal|bold|[1-9]00)$/.test(raw)) normalized = raw;
    if (name === "font-style" && /^(normal|italic)$/.test(raw)) normalized = raw;
    if (name === "text-decoration" && /^(none|underline)$/.test(raw)) normalized = raw;
    return normalized ? [`${name}:${normalized}`] : [];
  }).join(";");
}

/** 与按钮编辑能力保持一致，导出仅保留基础行内格式，不接受内部链接或块级布局。 */
export function buttonInlineHtml(html: string): string {
  const templates = protectTemplateTokens(html);
  html = templates.html;
  const source = (node: HtmlNode) => html.slice(node.from, node.to);
  const tagName = (node: HtmlNode) => {
    const tag = (node.getChild("OpenTag") ?? node.getChild("SelfClosingTag"))?.getChild("TagName");
    return tag ? source(tag).toLowerCase() : "";
  };
  const read = (node: HtmlNode): string => {
    if (node.name === "Text") return esc(source(node));
    if (node.name === "EntityReference" || node.name === "CharacterReference") return source(node);
    if (node.name !== "Element" && node.name !== "Document") return "";
    const open = node.getChild("OpenTag") ?? node.getChild("SelfClosingTag");
    const tag = tagName(node);
    if (OMIT_CONTENT.has(tag)) return "";
    let content = "";
    let previousBlock = false;
    for (let child = node.firstChild; child; child = child.nextSibling) {
      const next = read(child);
      const block = BLOCK_TAGS.has(tagName(child));
      if (next && content && (previousBlock || block)) content += " ";
      content += next;
      if (next) previousBlock = block;
    }
    const inline = INLINE_TAGS[tag];
    let style = "";
    for (const attribute of open?.getChildren("Attribute") ?? []) {
      const name = attribute.getChild("AttributeName");
      const value = attribute.getChild("AttributeValue");
      if (name && value && source(name).toLowerCase() === "style") {
        style = inlineStyle(source(value).replace(/^(["'])([\s\S]*)\1$/, "$2").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'"));
      }
    }
    const styled = style ? ` style="${esc(style)}"` : "";
    if (inline) return `<${inline}${styled}>${content}</${inline}>`;
    if (style) content = `<span${styled}>${content}</span>`;
    return tag === "br" ? " " : content;
  };
  return templates.restore(read(parser.parse(html).topNode));
}
