import type { EmailBlockStyle } from "../types/document";
import { esc } from "./html";

const STYLE_GROUPS = ["dimension", "typography", "decorations"] as const;

type StyleGroupKey = (typeof STYLE_GROUPS)[number];

function isStyleGroupKey(value: string): value is StyleGroupKey {
  return (STYLE_GROUPS as readonly string[]).includes(value);
}

export function readStyleValue(
  style: EmailBlockStyle | undefined,
  id: string,
): string {
  const [group, key] = id.split(".");
  if (!group || !key || !style || !isStyleGroupKey(group)) return "";
  const groupValue = style[group];
  if (!groupValue) return "";
  const value = (groupValue as Record<string, unknown>)[key];
  return value == null ? "" : String(value);
}

export function writeStyleValue(
  style: EmailBlockStyle | undefined,
  id: string,
  value: string,
): EmailBlockStyle {
  const [group, key] = id.split(".");
  const next: EmailBlockStyle = structuredClone(style ?? {});
  if (!group || !key || !isStyleGroupKey(group)) return next;
  const groupValue = { ...(next[group] ?? {}) } as Record<string, string>;
  if (value === "") {
    delete groupValue[key];
  } else {
    groupValue[key] = value;
  }
  next[group] = groupValue as EmailBlockStyle[StyleGroupKey];
  return next;
}

export function typographyCss(style: EmailBlockStyle | undefined): string {
  const typography = style?.typography ?? {};
  const parts: string[] = ["font-family:Arial,Helvetica,sans-serif"];
  if (typography.fontSize) parts.push(`font-size:${typography.fontSize}`);
  if (typography.fontWeight) parts.push(`font-weight:${typography.fontWeight}`);
  if (typography.lineHeight) parts.push(`line-height:${typography.lineHeight}`);
  if (typography.color) parts.push(`color:${typography.color}`);
  if (typography.textAlign) parts.push(`text-align:${typography.textAlign}`);
  return parts.join(";");
}

export function blockCellCss(style: EmailBlockStyle | undefined): string {
  const padding = style?.dimension?.padding ?? "0";
  const background = style?.decorations?.backgroundColor ?? "transparent";
  return `padding:${esc(padding)};background-color:${esc(background)};`;
}
