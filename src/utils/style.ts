import type { EmailBlockStyle, EmailGlobalSettings } from "../types/document";
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

function cssFontWeight(
  value: string | undefined,
  fallback?: string,
): "normal" | "bold" | undefined {
  const pick = (input: string | undefined) => {
    const weight = input?.trim().toLowerCase();
    if (weight === "normal" || weight === "400") return "normal" as const;
    if (weight === "bold" || weight === "700") return "bold" as const;
    return undefined;
  };
  return pick(value) ?? pick(fallback);
}

export function resolvedFontWeight(
  blockWeight: string | undefined,
  globalWeight: EmailGlobalSettings["fontWeight"],
): EmailGlobalSettings["fontWeight"] {
  return cssFontWeight(blockWeight, globalWeight) ?? "normal";
}

export function typographyCss(
  style: EmailBlockStyle | undefined,
  global?: EmailGlobalSettings,
): string {
  const typography = style?.typography ?? {};
  const parts: string[] = [];
  if (global?.fontFamily) parts.push(`font-family:${esc(global.fontFamily)}`);
  if (typography.fontSize) parts.push(`font-size:${esc(typography.fontSize)}`);
  const fontWeight = cssFontWeight(typography.fontWeight, global?.fontWeight);
  if (fontWeight) parts.push(`font-weight:${esc(fontWeight)}`);
  if (typography.lineHeight) parts.push(`line-height:${esc(typography.lineHeight)}`);
  const color = typography.color || global?.textColor;
  if (color) parts.push(`color:${esc(color)}`);
  if (typography.textAlign) parts.push(`text-align:${esc(typography.textAlign)}`);
  return parts.join(";");
}

export function emailBaseCss(global: EmailGlobalSettings): string {
  const background = global.backgroundColor || "#ffffff";
  return [
    `background-color:${esc(background)}`,
    `color:${esc(global.textColor)}`,
    `font-family:${esc(global.fontFamily)}`,
  ].join(";");
}

export function blockCellCss(
  style: EmailBlockStyle | undefined,
  global?: EmailGlobalSettings,
): string {
  const padding = style?.dimension?.padding ?? "0";
  const background = style?.decorations?.backgroundColor ?? "transparent";
  const parts = [
    `padding:${esc(padding)}`,
    `background-color:${esc(background)}`,
  ];
  if (global) {
    parts.push(`color:${esc(global.textColor)}`);
    parts.push(`font-family:${esc(global.fontFamily)}`);
  }
  return `${parts.join(";")};`;
}
