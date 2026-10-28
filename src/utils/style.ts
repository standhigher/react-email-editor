import type { CSSProperties } from "react";
import { FONT_WEIGHTS, isStyleValue, type FontWeight } from "../constants/style-values";
import type { EmailBlockStyle, EmailBodySettings, EmailDecorationStyle } from "../types/document";
import { DEFAULT_TYPOGRAPHY } from "../constants/typography";
import { typographyWithBody } from "./typography";
import { cornerRadii, cssBorderStyle, cssColor, cssFont, cssLength, cssLineHeight, cssPx, cssSpacing } from "./css-values";
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

export function resolvedFontWeight(blockWeight: string | undefined, fallback: FontWeight = DEFAULT_TYPOGRAPHY.fontWeight): FontWeight {
  return isStyleValue(FONT_WEIGHTS, blockWeight) ? blockWeight : fallback;
}

export function typographyStyle(style: EmailBlockStyle | undefined, body?: EmailBodySettings): CSSProperties {
  const settings = typographyWithBody(body);
  const typography = style?.typography ?? {};
  return {
    fontFamily: cssFont(typography.fontFamily, settings.fontFamily),
    fontSize: cssLength(typography.fontSize, settings.fontSize),
    fontWeight: resolvedFontWeight(typography.fontWeight, settings.fontWeight),
    lineHeight: cssLineHeight(typography.lineHeight, settings.lineHeight),
    color: cssColor(typography.color, settings.color),
    textAlign: typography.textAlign ?? settings.textAlign,
  };
}

/** 四角相同保留单值缩写；四角不同写长属性，避免多值缩写在转发时被收成第一角。 */
export function radiusStyle(value: string | undefined): CSSProperties {
  const [topLeft, topRight, bottomRight, bottomLeft] = cornerRadii(value ?? "");
  if (topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft) return { borderRadius: topLeft };
  return {
    borderTopLeftRadius: topLeft,
    borderTopRightRadius: topRight,
    borderBottomRightRadius: bottomRight,
    borderBottomLeftRadius: bottomLeft,
  };
}

export function decorationStyle(decoration: EmailDecorationStyle = {}): CSSProperties {
  return {
    backgroundColor: cssColor(decoration.backgroundColor),
    borderWidth: cssLength(decoration.borderWidth),
    borderStyle: cssBorderStyle(decoration.borderStyle),
    borderColor: cssColor(decoration.borderColor, "transparent"),
    ...radiusStyle(decoration.borderRadius),
  };
}

export function styleToCss(style: CSSProperties): string {
  return Object.entries(style).filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${esc(String(value))}`)
    .join(";");
}

export function typographyCss(style: EmailBlockStyle | undefined, body?: EmailBodySettings): string {
  return styleToCss(typographyStyle(style, body));
}

export function emailBaseCss(body?: EmailBodySettings): string {
  return typographyCss(undefined, body);
}

export function blockContentStyle(style: EmailBlockStyle | undefined, body?: EmailBodySettings): CSSProperties {
  return {
    ...typographyStyle(style, body),
    ...decorationStyle(style?.decorations),
    padding: cssSpacing(style?.dimension?.padding),
    overflowWrap: "anywhere",
  };
}

export function blockCellCss(style: EmailBlockStyle | undefined, body?: EmailBodySettings): string {
  const css: CSSProperties = { ...blockContentStyle(style, body) };
  const height = cssPx(style?.dimension?.height);
  if (height) {
    css.boxSizing = "border-box";
    css.height = `${height}px`;
    css.verticalAlign = "top";
  }
  return `${styleToCss(css)};`;
}
