import { cssLength } from "../utils/css-values";
import { esc } from "../utils/html";
import { styleRichText } from "../render/content-style";
import { protectTemplateTokens } from "../render/template-tokens";
import type { EmailBodySettings } from "../types/document";

const EMAIL_MARKUP = Symbol("email-markup");

export interface EmailMarkup {
  readonly [EMAIL_MARKUP]: true;
  readonly html: string;
}

export interface EmailImageOptions {
  src: string;
  alt?: string;
  width?: string;
}

export interface EmailButtonOptions {
  href: string;
  label: string;
}

export interface EmailTools {
  html: (strings: TemplateStringsArray, ...values: unknown[]) => EmailMarkup;
  raw: (html: string) => EmailMarkup;
  richText: (html: string) => EmailMarkup;
  table: (rows: EmailMarkup[][]) => EmailMarkup;
  image: (options: EmailImageOptions) => EmailMarkup;
  button: (options: EmailButtonOptions) => EmailMarkup;
  url: (value: string, image?: boolean) => string;
}

/** 模板表达式保留原文；普通文本及属性内容进行 HTML 转义。 */
function escapeValue(value: string): string {
  const tokens = protectTemplateTokens(value);
  return tokens.restore(esc(tokens.html));
}

export function safeEmailUrl(value: string, image = false): string {
  const url = value.trim();
  if (!url) return "";
  if ([...url.replace(/\{\{[\s\S]*?\}\}/g, "")].some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return "";
  if (/^\{\{[\s\S]*\}\}$/.test(url)) return url;
  const protocols = image ? /^(?:https?:|cid:)/i : /^(?:https?:|mailto:|tel:)/i;
  return protocols.test(url) || (!image && url.startsWith("#")) ? url : "";
}

export function emailMarkup(value: string | EmailMarkup): string {
  return typeof value === "string" ? value : value.html;
}

export function createEmailTools(body: EmailBodySettings): EmailTools {
  const raw = (html: string): EmailMarkup => ({ html, [EMAIL_MARKUP]: true });
  const interpolate = (value: unknown): string => {
    if (Array.isArray(value)) return value.map(interpolate).join("");
    if (value && typeof value === "object" && EMAIL_MARKUP in value && value[EMAIL_MARKUP] === true && "html" in value && typeof value.html === "string") return value.html;
    return escapeValue(value == null ? "" : String(value));
  };
  return {
    raw,
    html: (strings, ...values) => raw(strings.reduce((result, part, index) => result + part + (index < values.length ? interpolate(values[index]) : ""), "")),
    richText: (html) => raw(styleRichText(html, undefined, body)),
    table: (rows) => raw(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.map((cells) => `<tr>${cells.map((cell) => `<td>${cell.html}</td>`).join("")}</tr>`).join("")}</table>`),
    image: ({ src, alt = "", width = "100%" }) => raw(`<img src="${escapeValue(safeEmailUrl(src, true))}" alt="${escapeValue(alt)}" style="display:block;border:0;max-width:100%;width:${esc(cssLength(width, "100%"))};height:auto;" />`),
    button: ({ href, label }) => {
      const url = safeEmailUrl(href);
      const tag = url ? "a" : "span";
      return raw(`<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#000000;padding:12px 24px;"><${tag}${url ? ` href="${escapeValue(url)}"` : ""} style="color:#ffffff;text-decoration:none;">${escapeValue(label)}</${tag}></td></tr></table>`);
    },
    url: safeEmailUrl,
  };
}
