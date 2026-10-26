import type { CSSProperties } from "react";
import { FONT_WEIGHTS, isStyleValue, type FontWeight } from "../constants/style-values";
import type { EmailBlockStyle, EmailDecorationStyle, EmailGlobalSettings } from "../types/document";
import { resolveEmailGlobal } from "../document/create-document";
import { cssBorderStyle, cssColor, cssFont, cssLength, cssLineHeight, cssSpacing } from "./css-values";
import { esc } from "./html";

export function readStyleValue(style: EmailBlockStyle | undefined, id: string): string {
  const [group, key] = id.split(".");
  const values = style?.[group as keyof EmailBlockStyle];
  return values ? String((values as Record<string, unknown>)[key] ?? "") : "";
}

export function writeStyleValue(style: EmailBlockStyle | undefined, id: string, value: string): EmailBlockStyle {
  const [group, key] = id.split(".");
  const next = structuredClone(style ?? {});
  if (!key || !["dimension", "typography", "decorations", "element"].includes(group)) return next;
  const groupKey = group as keyof EmailBlockStyle;
  const values = { ...next[groupKey] } as Record<string, string>;
  if (value === "") delete values[key];
  else values[key] = value;
  next[groupKey] = values;
  return next;
}

export function resolvedFontWeight(blockWeight: string | undefined, globalWeight: EmailGlobalSettings["fontWeight"]): FontWeight {
  return isStyleValue(FONT_WEIGHTS, blockWeight) ? blockWeight : globalWeight;
}

export function typographyStyle(style: EmailBlockStyle | undefined, global?: EmailGlobalSettings): CSSProperties {
  const settings = resolveEmailGlobal(global);
  const typography = style?.typography ?? {};
  return {
    fontFamily: cssFont(typography.fontFamily, settings.fontFamily),
    fontSize: cssLength(typography.fontSize, settings.defaultFontSize),
    fontWeight: resolvedFontWeight(typography.fontWeight, settings.fontWeight),
    lineHeight: cssLineHeight(typography.lineHeight, settings.defaultLineHeight),
    color: cssColor(typography.color, settings.textColor),
    textAlign: typography.textAlign ?? settings.textAlign,
  };
}

export function decorationStyle(decoration: EmailDecorationStyle = {}): CSSProperties {
  return {
    backgroundColor: cssColor(decoration.backgroundColor),
    borderWidth: cssLength(decoration.borderWidth),
    borderStyle: cssBorderStyle(decoration.borderStyle),
    borderColor: cssColor(decoration.borderColor, "#000000"),
    borderRadius: cssLength(decoration.borderRadius),
  };
}

export function styleToCss(style: CSSProperties): string {
  return Object.entries(style).filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${esc(String(value))}`)
    .join(";");
}

export function typographyCss(style: EmailBlockStyle | undefined, global?: EmailGlobalSettings): string {
  return styleToCss(typographyStyle(style, global));
}

export function emailBaseCss(global: EmailGlobalSettings): string {
  return typographyCss(undefined, global);
}

export function blockContentStyle(style: EmailBlockStyle | undefined, global?: EmailGlobalSettings): CSSProperties {
  return {
    ...typographyStyle(style, global),
    ...decorationStyle(style?.decorations),
    padding: cssSpacing(style?.dimension?.padding),
    overflowWrap: "anywhere",
  };
}

export function blockCellCss(style: EmailBlockStyle | undefined, global?: EmailGlobalSettings): string {
  return `${styleToCss(blockContentStyle(style, global))};`;
}
