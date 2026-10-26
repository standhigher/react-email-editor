import type { Editor } from "@tiptap/react";
import type { EditorTextRange, TextAlignment, ToolbarState } from "./types";

const ALIGNMENTS: TextAlignment[] = ["left", "center", "right", "justify"];

function textAttribute(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function markWeight(value: unknown): ToolbarState["fontWeight"] {
  return value === "normal" || value === "bold" ? value : "";
}

export function isVisuallyBold(
  markWeightValue: ToolbarState["fontWeight"],
  strong: boolean,
  inherited: "normal" | "bold",
): boolean {
  if (strong || markWeightValue === "bold") return true;
  if (markWeightValue === "normal") return false;
  return inherited === "bold";
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
  };
}

export function toggleVisualBold(editor: Editor, inherited: "normal" | "bold") {
  const state = readToolbarState(editor);
  const visuallyBold = isVisuallyBold(state.fontWeight, state.bold, inherited);
  const chain = editor.chain().focus().unsetBold();
  if (visuallyBold) {
    if (inherited === "bold") {
      chain.setMark("textStyle", { fontWeight: "normal" }).run();
      return;
    }
    chain.setMark("textStyle", { fontWeight: null }).removeEmptyTextStyle().run();
    return;
  }
  if (inherited === "bold") {
    chain.setMark("textStyle", { fontWeight: null }).removeEmptyTextStyle().run();
    return;
  }
  chain.setMark("textStyle", { fontWeight: "bold" }).run();
}

export function toColorInputValue(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export function focusSelection(editor: Editor, range: EditorTextRange | null) {
  const chain = editor.chain().focus();
  if (!range) return chain;
  return chain.setTextSelection(range);
}

export function currentSelection(editor: Editor): EditorTextRange {
  const { from, to } = editor.state.selection;
  return { from, to };
}
