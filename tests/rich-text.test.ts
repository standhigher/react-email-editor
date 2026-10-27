import assert from "node:assert/strict";
import test from "node:test";
import { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit, TextStyle } from "@tiptap/extension-text-style";
import { currentSelection, formatText, toggleVisualBold } from "../src/stage/rich-text/formatting.ts";
import { toggleTextList } from "../src/stage/rich-text/list-formatting.ts";

function createEditor(texts = ["First", "Second"]) {
  return new Editor({
    element: null,
    extensions: [
      StarterKit,
      TextStyleKit.configure({ textStyle: false }),
      TextStyle.extend({
        addAttributes() {
          return { ...this.parent?.(), fontWeight: { default: null } };
        },
      }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: {
      type: "doc",
      content: texts.map((text) => ({
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      })),
    },
  });
}

function textSizes(editor: Editor) {
  const sizes: string[] = [];
  editor.state.doc.descendants((node) => {
    if (node.isText) sizes.push(String(node.marks.find((mark) => mark.type.name === "textStyle")?.attrs.fontSize ?? ""));
  });
  return sizes;
}

test("光标模式连续格式化整块，恢复光标，继续输入不会替换全文", () => {
  const editor = createEditor();
  editor.commands.setTextSelection(3);
  formatText(editor, (chain) => chain.setFontSize("24px"));
  formatText(editor, (chain) => chain.setFontFamily("Georgia, serif"));
  assert.deepEqual(textSizes(editor), ["24px", "24px"]);
  editor.state.doc.descendants((node) => {
    if (node.isText) assert.equal(node.marks[0]?.attrs.fontFamily, "Georgia, serif");
  });
  assert.equal(editor.state.selection.from, 3);
  assert.equal(editor.state.selection.empty, true);
  editor.commands.insertContent({ type: "text", text: "!" });
  assert.equal(editor.state.doc.textContent, "Fi!rstSecond");
  editor.destroy();
});

test("局部选区仅格式化对应文字，菜单保存的选区可恢复", () => {
  const editor = createEditor();
  editor.commands.setTextSelection(1);
  formatText(editor, (chain) => chain.setFontSize("18px"), { anchor: 2, head: 4, storedMarks: null });
  assert.deepEqual(textSizes(editor), ["", "18px", "", ""]);
  assert.equal(editor.state.selection.from, 2);
  assert.equal(editor.state.selection.to, 4);
  formatText(editor, (chain) => chain.toggleItalic());
  const italic: string[] = [];
  editor.state.doc.descendants((node) => {
    if (node.isText && node.marks.some((mark) => mark.type.name === "italic")) italic.push(node.text!);
  });
  assert.deepEqual(italic, ["ir"]);
  editor.destroy();
});

test("对齐操作区分整块和选区涉及的段落", () => {
  const editor = createEditor();
  formatText(editor, (chain) => chain.setTextAlign("center"), null, "paragraph");
  assert.equal(editor.state.doc.child(0).attrs.textAlign, "center");
  assert.equal(editor.state.doc.child(1).attrs.textAlign, "center");
  formatText(editor, (chain) => chain.setTextAlign("right"), { anchor: 2, head: 4, storedMarks: null }, "paragraph");
  assert.equal(editor.state.doc.child(0).attrs.textAlign, "right");
  assert.equal(editor.state.doc.child(1).attrs.textAlign, "center");
  editor.destroy();
});

test("列表转换后映射原光标，连续切换列表不丢失文字", () => {
  const editor = createEditor();
  editor.commands.setTextSelection(3);
  toggleTextList(editor, "bulletList");
  assert.equal(editor.state.doc.firstChild?.type.name, "bulletList");
  assert.equal(editor.state.doc.firstChild?.childCount, 2);
  assert.equal(editor.state.selection.$from.parent.textContent, "First");
  assert.equal(editor.state.selection.$from.parentOffset, 2);
  toggleTextList(editor, "orderedList");
  assert.equal(editor.state.doc.firstChild?.type.name, "orderedList");
  assert.equal(editor.state.doc.textContent, "FirstSecond");
  assert.equal(editor.state.selection.empty, true);
  editor.destroy();
});

test("整块加粗及继承粗体的取消操作均可连续切换", () => {
  for (const inherited of ["normal", "bold"] as const) {
    const editor = createEditor();
    toggleVisualBold(editor, inherited);
    editor.state.doc.descendants((node) => {
      if (node.isText) assert.equal(node.marks[0]?.attrs.fontWeight, inherited === "normal" ? "bold" : "normal");
    });
    toggleVisualBold(editor, inherited);
    editor.state.doc.descendants((node) => {
      if (node.isText) assert.equal(node.marks.length, 0);
    });
    assert.equal(editor.state.selection.empty, true);
    editor.destroy();
  }
});

test("空区块保留格式供后续输入使用", () => {
  const editor = createEditor([""]);
  formatText(editor, (chain) => chain.setFontSize("20px"));
  editor.commands.insertContent({ type: "text", text: "Hello" });
  assert.deepEqual(textSizes(editor), ["20px"]);
  editor.destroy();
});

test("混合粗体在整块操作时先统一加粗，再统一取消", () => {
  const editor = createEditor();
  formatText(editor, (chain) => chain.setMark("textStyle", { fontWeight: "bold" }), { anchor: 1, head: 3, storedMarks: null });
  editor.commands.setTextSelection(1);
  toggleVisualBold(editor, "normal");
  editor.state.doc.descendants((node) => {
    if (node.isText) assert.equal(node.marks[0]?.attrs.fontWeight, "bold");
  });
  toggleVisualBold(editor, "normal");
  editor.state.doc.descendants((node) => {
    if (node.isText) assert.equal(node.marks.length, 0);
  });
  editor.destroy();
});

test("空区块连续菜单操作合并字号、字体和颜色", () => {
  const editor = createEditor([""]);
  formatText(editor, (chain) => chain.setFontSize("24px"), currentSelection(editor));
  formatText(editor, (chain) => chain.setFontFamily("Georgia, serif"), currentSelection(editor));
  formatText(editor, (chain) => chain.setColor("#123456"), currentSelection(editor));
  editor.commands.insertContent({ type: "text", text: "Hello" });
  const mark = editor.state.doc.firstChild?.firstChild?.marks.find((item) => item.type.name === "textStyle");
  assert.equal(mark?.attrs.fontSize, "24px");
  assert.equal(mark?.attrs.fontFamily, "Georgia, serif");
  assert.equal(mark?.attrs.color, "#123456");
  editor.destroy();
});

test("纯空段落的整块对齐覆盖所有段落并保留输入格式", () => {
  const editor = createEditor(["", ""]);
  formatText(editor, (chain) => chain.setFontSize("24px"), currentSelection(editor));
  formatText(editor, (chain) => chain.setTextAlign("center"), currentSelection(editor), "paragraph");
  assert.equal(editor.state.doc.child(0).attrs.textAlign, "center");
  assert.equal(editor.state.doc.child(1).attrs.textAlign, "center");
  assert.equal(editor.state.selection.anchor, 1);
  assert.equal(editor.state.selection.head, 1);
  editor.commands.insertContent({ type: "text", text: "Hello" });
  assert.deepEqual(textSizes(editor), ["24px"]);
  editor.destroy();
});

test("反向选区经菜单格式化后保持方向，后续键盘扩选方向不变", () => {
  const editor = createEditor();
  editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 5, 2)));
  const saved = currentSelection(editor);
  editor.commands.setTextSelection(1);
  formatText(editor, (chain) => chain.setFontSize("24px"), saved);
  assert.equal(editor.state.selection.anchor, 5);
  assert.equal(editor.state.selection.head, 2);
  assert.deepEqual(textSizes(editor), ["", "24px", "", ""]);
  editor.destroy();
});

test("颜色面板重置只清除保存选区的颜色，保留字号、粗体和选区方向", () => {
  const editor = createEditor();
  formatText(editor, (chain) => chain.setColor("#123456").setFontSize("24px").setBold());
  editor.commands.setTextSelection({ from: 4, to: 2 });
  const saved = currentSelection(editor);
  editor.commands.setTextSelection(1);
  formatText(editor, (chain) => chain.unsetColor(), saved, "text", false);
  assert.equal(editor.state.selection.anchor, 4);
  assert.equal(editor.state.selection.head, 2);
  const uncolored: string[] = [];
  editor.state.doc.descendants((node) => {
    if (!node.isText) return;
    const mark = node.marks.find((item) => item.type.name === "textStyle");
    assert.equal(mark?.attrs.fontSize, "24px");
    assert.equal(node.marks.some((item) => item.type.name === "bold"), true);
    if (!mark?.attrs.color) uncolored.push(node.text!);
    else assert.equal(mark.attrs.color, "#123456");
  });
  assert.deepEqual(uncolored, ["ir"]);
  editor.destroy();
});

test("颜色面板支持整块及空区块重置，后续输入不带显式颜色", () => {
  for (const texts of [["First", "Second"], [""]]) {
    const editor = createEditor(texts);
    formatText(editor, (chain) => chain.setColor("#123456").setFontSize("24px"));
    formatText(editor, (chain) => chain.unsetColor(), currentSelection(editor), "text", false);
    editor.commands.insertContent({ type: "text", text: "!" });
    editor.state.doc.descendants((node) => {
      if (!node.isText) return;
      const mark = node.marks.find((item) => item.type.name === "textStyle");
      assert.equal(mark?.attrs.color ?? null, null);
      assert.equal(mark?.attrs.fontSize, "24px");
    });
    assert.equal(editor.state.doc.textContent, `!${texts.join("")}`);
    editor.destroy();
  }
});
