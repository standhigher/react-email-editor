import type { CSSProperties } from "react";
import { resolveEmailGlobal } from "../document/create-document";
import type { EmailBlockStyle, EmailGlobalSettings } from "../types/document";
import { cssColor, cssLength } from "../utils/css-values";

export function contentDefaults(style: EmailBlockStyle | undefined, global: EmailGlobalSettings) {
  const settings = resolveEmailGlobal(global);
  const typography = style?.typography;
  return {
    paragraph: cssLength(typography?.paragraphSpacing, settings.paragraphSpacing),
    listSpacing: cssLength(typography?.listSpacing, settings.listSpacing),
    listIndent: cssLength(typography?.listIndent, settings.listIndent),
    linkColor: cssColor(typography?.linkColor, settings.linkColor),
    linkDecoration: typography?.linkDecoration ?? settings.linkDecoration,
  };
}

export function contentVariables(style: EmailBlockStyle | undefined, global: EmailGlobalSettings): CSSProperties {
  const values = contentDefaults(style, global);
  return {
    "--ree-paragraph-spacing": values.paragraph,
    "--ree-list-spacing": values.listSpacing,
    "--ree-list-indent": values.listIndent,
    "--ree-link-color": values.linkColor,
    "--ree-link-decoration": values.linkDecoration,
  } as CSSProperties;
}

interface TopLevelNode {
  kind: "p" | "list";
  paragraph: number;
}

/** 段落间距只加在相邻的顶层段落之间；列表内的段落不加。 */
function paragraphSpacingPlan(html: string): boolean[] {
  const spaced: boolean[] = [];
  const topLevel: TopLevelNode[] = [];
  let liDepth = 0;
  let paragraph = 0;
  const tokens = /<!--[\s\S]*?-->|<\/(li)\b[^>]*>|<(li|p|ul|ol)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tokens.exec(html))) {
    if (match[0].startsWith("<!--")) continue;
    const closing = match[1]?.toLowerCase();
    const opening = match[2]?.toLowerCase();
    if (closing === "li") liDepth = Math.max(0, liDepth - 1);
    if (opening === "li") liDepth += 1;
    if (opening === "p") {
      const index = paragraph;
      paragraph += 1;
      spaced.push(false);
      if (liDepth === 0) topLevel.push({ kind: "p", paragraph: index });
    }
    if ((opening === "ul" || opening === "ol") && liDepth === 0) topLevel.push({ kind: "list", paragraph: -1 });
  }
  for (let index = 0; index < topLevel.length - 1; index += 1) {
    const current = topLevel[index];
    const next = topLevel[index + 1];
    if (current.kind === "p" && next.kind === "p") spaced[current.paragraph] = true;
  }
  return spaced;
}

/** 内联默认排版，使邮件客户端不依赖编辑器样式表；已有显式样式仍有优先级。 */
export function styleRichText(html: string, style: EmailBlockStyle | undefined, global: EmailGlobalSettings): string {
  const values = contentDefaults(style, global);
  const spaced = paragraphSpacingPlan(html);
  let paragraph = 0;
  return html.replace(/<!--[\s\S]*?-->|<(p|ul|ol|a)\b([^>]*)>/gi, (tag, name?: string, attributes?: string) => {
    if (!name || tag.startsWith("<!--")) return tag;
    const lower = name.toLowerCase();
    const defaults = lower === "p"
      ? `margin:${spaced[paragraph++] ? `0 0 ${values.paragraph}` : "0"};`
      : lower === "a"
        ? `color:${values.linkColor};text-decoration:${values.linkDecoration};`
        : `margin:${values.listSpacing} 0;padding-left:${values.listIndent};`;
    const attrs = attributes ?? "";
    const match = attrs.match(/\sstyle\s*=\s*(["'])(.*?)\1/i);
    const existing = match?.[2] ?? "";
    const rest = match ? attrs.replace(match[0], "") : attrs;
    return `<${name}${rest} style="${defaults}${existing.replace(/"/g, "&quot;")}">`;
  });
}
