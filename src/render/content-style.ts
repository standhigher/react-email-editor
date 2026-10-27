import type { CSSProperties } from "react";
import { resolveEmailGlobal } from "../document/create-document";
import type { EmailBlockStyle, EmailGlobalSettings } from "../types/document";
import { cssColor, cssLength, cssLineHeight } from "../utils/css-values";

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

function attributeValue(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2];
}

function omitAttribute(attrs: string, name: string): string {
  return attrs.replace(new RegExp(`\\s${name}\\s*=\\s*(["']).*?\\1`, "gi"), "");
}

/** 没有命中的样式保持原样，避免改动作者已经写好的声明。 */
function stripDeclarations(style: string, pattern: RegExp): string {
  const parts = style.split(";").map((part) => part.trim()).filter(Boolean);
  const kept = parts.filter((part) => !pattern.test(part));
  return kept.length === parts.length ? style : kept.join(";");
}

interface ParagraphPlacement {
  topLevel: boolean;
  followsParagraph: boolean;
}

/** 默认段距只加在相邻顶层段落之间。列表里的段落不参与。 */
function paragraphPlacements(html: string): ParagraphPlacement[] {
  const placements: ParagraphPlacement[] = [];
  const topLevel: TopLevelNode[] = [];
  let liDepth = 0;
  const tokens = /<!--[\s\S]*?-->|<\/(li)\b[^>]*>|<(li|p|ul|ol)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tokens.exec(html))) {
    if (match[0].startsWith("<!--")) continue;
    const closing = match[1]?.toLowerCase();
    const opening = match[2]?.toLowerCase();
    if (closing === "li") liDepth = Math.max(0, liDepth - 1);
    if (opening === "li") liDepth += 1;
    if (opening === "p") {
      placements.push({ topLevel: liDepth === 0, followsParagraph: false });
      if (liDepth === 0) topLevel.push({ kind: "p", paragraph: placements.length - 1 });
    }
    if ((opening === "ul" || opening === "ol") && liDepth === 0) topLevel.push({ kind: "list", paragraph: -1 });
  }
  for (let index = 0; index < topLevel.length - 1; index += 1) {
    const current = topLevel[index];
    const next = topLevel[index + 1];
    if (current?.kind === "p" && next?.kind === "p") {
      const placement = placements[next.paragraph];
      if (placement) placement.followsParagraph = true;
    }
  }
  return placements;
}

function paragraphMargin(gap: string): string {
  return gap === "0px" ? "margin:0;" : `margin:${gap} 0 0 0;`;
}

/** 内联默认排版，使邮件客户端不依赖编辑器样式表。没有段落属性时，作者已有 style 仍优先。 */
export function styleRichText(html: string, style: EmailBlockStyle | undefined, global: EmailGlobalSettings): string {
  const values = contentDefaults(style, global);
  const placements = paragraphPlacements(html);
  let paragraph = 0;
  return html.replace(/<!--[\s\S]*?-->|<(p|ul|ol|a)\b([^>]*)>/gi, (tag, name?: string, attributes?: string) => {
    if (!name || tag.startsWith("<!--")) return tag;
    const lower = name.toLowerCase();
    const attrs = attributes ?? "";
    const match = attrs.match(/\sstyle\s*=\s*(["'])(.*?)\1/i);
    let existing = match?.[2] ?? "";
    let rest = match ? attrs.replace(match[0], "") : attrs;
    let defaults = lower === "a"
      ? `color:${values.linkColor};text-decoration:${values.linkDecoration};`
      : `margin:${values.listSpacing} 0;padding-left:${values.listIndent};`;
    if (lower === "p") {
      const placement = placements[paragraph++] ?? { topLevel: false, followsParagraph: false };
      const explicitSpacing = attributeValue(attrs, "data-spacing");
      const explicitLineHeight = attributeValue(attrs, "data-line-height");
      const spacing = explicitSpacing === undefined ? "" : cssLength(explicitSpacing, "");
      const lineHeight = explicitLineHeight === undefined ? "" : cssLineHeight(explicitLineHeight, "");
      const gap = placement.topLevel && spacing
        ? spacing
        : placement.followsParagraph
          ? values.paragraph
          : "0px";
      existing = stripDeclarations(existing, /^--ree-paragraph-gap\s*:/i);
      if (placement.topLevel && spacing) existing = stripDeclarations(existing, /^margin(?:-(?:top|right|bottom|left))?\s*:/i);
      if (lineHeight) existing = stripDeclarations(existing, /^line-height\s*:/i);
      rest = omitAttribute(omitAttribute(rest, "data-spacing"), "data-line-height");
      defaults = `${paragraphMargin(gap)}${lineHeight ? `line-height:${lineHeight};` : ""}`;
    }
    return `<${name}${rest} style="${defaults}${existing.replace(/"/g, "&quot;")}">`;
  });
}
