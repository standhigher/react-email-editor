import type { Editor } from "@tiptap/react";
import { FONT_WEIGHTS, TEXT_ALIGNS, type TextAlign } from "../../constants/style-values";
import type { ToolbarState } from "./types";

const ALIGNMENTS = Object.values(TEXT_ALIGNS) as TextAlign[];

function textAttribute(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function markWeight(value: unknown): ToolbarState["fontWeight"] {
  return value === FONT_WEIGHTS.normal || value === FONT_WEIGHTS.bold ? value : "";
}

export function readToolbarState(editor: Editor): ToolbarState {
  const textStyle = editor.getAttributes("textStyle");
  const link = editor.getAttributes("link");
  return {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    strike: editor.isActive("strike"),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    align: ALIGNMENTS.find((value) => editor.isActive({ textAlign: value })) ?? "",
    fontFamily: textAttribute(textStyle.fontFamily),
    fontSize: textAttribute(textStyle.fontSize),
    fontWeight: markWeight(textStyle.fontWeight),
    color: textAttribute(textStyle.color),
    linkHref: textAttribute(link.href),
    spacing: textAttribute(editor.getAttributes("paragraph").spacing),
    lineHeight: textAttribute(editor.getAttributes("paragraph").lineHeight),
  };
}

export function toColorInputValue(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}
