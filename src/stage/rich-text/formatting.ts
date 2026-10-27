import { getAttributes, isMarkActive, type ChainedCommands, type Editor } from "@tiptap/react";
import type { EditorTextRange, RichTextInheritedStyle, ToolbarState } from "./types";

/** 保留选区方向及尚未写入内容的格式，供工具栏菜单恢复。 */
export function currentSelection(editor: Editor): EditorTextRange {
  const { selection, storedMarks } = editor.state;
  return { anchor: selection.anchor, head: selection.head, storedMarks };
}

export function focusSelection(editor: Editor, range?: EditorTextRange | null, focus = true) {
  const chain = focus ? editor.chain().focus() : editor.chain();
  if (!range) return chain;
  return chain.command(({ tr, commands }) => {
    if (tr.selection.anchor !== range.anchor || tr.selection.head !== range.head) {
      commands.setTextSelection({ from: range.anchor, to: range.head });
    }
    if (tr.selection.empty) tr.setStoredMarks(range.storedMarks);
    return true;
  });
}

/** 无选区时格式化整个区块；在同一事务中恢复光标，避免下一次输入替换全文。 */
export function formatText(
  editor: Editor,
  command: (chain: ChainedCommands) => ChainedCommands,
  range?: EditorTextRange | null,
  scope: "text" | "paragraph" = "text",
  focus = true,
): boolean {
  const chain = focusSelection(editor, range, focus);
  return chain.command(({ tr, chain: scopedChain }) => {
    const selection = tr.selection;
    const pendingMarks = tr.storedMarks;
    const bookmark = selection.getBookmark();
    const scoped = scopedChain();
    if (selection.empty && (scope === "paragraph" || tr.doc.textContent)) scoped.selectAll();
    return command(scoped).command(({ tr: formatted }) => {
      const marks = formatted.storedMarks;
      formatted.setSelection(bookmark.map(formatted.mapping).resolve(formatted.doc));
      // 空区块没有文字可改，保留格式供后续输入使用。
      if (!formatted.doc.textContent) formatted.setStoredMarks(scope === "paragraph" ? pendingMarks : marks);
      return true;
    }).run();
  }).run();
}

export function isVisuallyBold(
  markWeight: ToolbarState["fontWeight"],
  strong: boolean,
  inherited: RichTextInheritedStyle["fontWeight"],
): boolean {
  if (strong || markWeight === "bold") return true;
  if (markWeight === "normal") return false;
  return inherited === "bold";
}

export function toggleVisualBold(
  editor: Editor,
  inherited: RichTextInheritedStyle["fontWeight"],
): boolean {
  return formatText(editor, (chain) => chain.command(({ state, chain: scopedChain }) => {
    const weight: unknown = getAttributes(state, "textStyle").fontWeight;
    let visuallyBold = isVisuallyBold(
      weight === "normal" || weight === "bold" ? weight : "",
      isMarkActive(state, "bold"),
      inherited,
    );
    // 混合格式先统一加粗；只有目标范围全部为粗体时才取消。
    if (!state.selection.empty) {
      visuallyBold = true;
      state.doc.nodesBetween(state.selection.from, state.selection.to, (node) => {
        if (!node.isText) return;
        const textWeight: unknown = node.marks.find((mark) => mark.type.name === "textStyle")?.attrs.fontWeight;
        if (!isVisuallyBold(
          textWeight === "normal" || textWeight === "bold" ? textWeight : "",
          node.marks.some((mark) => mark.type.name === "bold"),
          inherited,
        )) visuallyBold = false;
      });
    }
    const next = scopedChain().unsetBold();
    const fontWeight = visuallyBold
      ? inherited === "bold" ? "normal" : null
      : inherited === "bold" ? null : "bold";
    return next.setMark("textStyle", { fontWeight }).removeEmptyTextStyle().run();
  }));
}
