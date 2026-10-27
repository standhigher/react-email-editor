import assert from "node:assert/strict";
import test from "node:test";
import { Editor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toggleTextList } from "../src/stage/rich-text/list-formatting.ts";

function editorWithLists() {
  return new Editor({
    element: null,
    extensions: [StarterKit, Extension.create({
      name: "testListAttributes",
      addGlobalAttributes() {
        return [{ types: ["bulletList", "orderedList"], attributes: { listSpacing: { default: null }, listIndent: { default: null } } }];
      },
    })],
    content: { type: "doc", content: [{
      type: "bulletList", attrs: { listSpacing: "12px", listIndent: "23px" }, content: [{
        type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First", marks: [{ type: "bold" }] }] }],
      }],
    }, { type: "paragraph" }] },
  });
}

test("列表反复切换保留外观、粗体和光标，不转换末尾辅助空段", () => {
  const editor = editorWithLists();
  editor.commands.setTextSelection(5);
  for (const type of ["orderedList", "bulletList", "orderedList"] as const) {
    toggleTextList(editor, type);
    const list = editor.state.doc.firstChild!;
    assert.equal(list.type.name, type);
    assert.equal(list.attrs.listSpacing, "12px");
    assert.equal(list.attrs.listIndent, "23px");
    assert.equal(list.childCount, 1);
    assert.equal(editor.state.doc.childCount, 2);
    assert.equal(editor.state.doc.lastChild?.type.name, "paragraph");
    assert.equal(editor.state.selection.$from.parentOffset, 2);
    assert.equal(list.firstChild?.firstChild?.firstChild?.marks[0]?.type.name, "bold");
  }
  toggleTextList(editor, "orderedList");
  assert.equal(editor.state.doc.firstChild?.type.name, "paragraph");
  assert.equal(editor.state.doc.textContent, "First");
  assert.equal(editor.state.selection.$from.parentOffset, 2);
  editor.destroy();
});

test("有选区时只转换命中的列表，保留不同列表各自的属性与反向选区", () => {
  const editor = editorWithLists();
  const first = editor.state.doc.firstChild!;
  const second = first.type.create({ listSpacing: "4px", listIndent: "40px" }, first.content);
  editor.commands.command(({ tr }) => { tr.insert(first.nodeSize, second); return true; });
  editor.commands.setTextSelection({ from: 7, to: 4 });
  toggleTextList(editor, "orderedList");
  assert.equal(editor.state.doc.child(0).type.name, "orderedList");
  assert.equal(editor.state.doc.child(0).attrs.listIndent, "23px");
  assert.equal(editor.state.doc.child(1).type.name, "bulletList");
  assert.equal(editor.state.doc.child(1).attrs.listIndent, "40px");
  assert.equal(editor.state.selection.anchor, 7);
  assert.equal(editor.state.selection.head, 4);
  editor.destroy();
});

test("整块转换多个列表分别保留外观，连续段落成为同一个列表", () => {
  const editor = editorWithLists();
  const first = editor.state.doc.firstChild!;
  const second = first.type.create({ listSpacing: "4px", listIndent: "40px" }, first.content);
  const paragraph = editor.schema.nodes.paragraph.create(null, editor.schema.text("Between"));
  editor.commands.command(({ tr }) => { tr.insert(first.nodeSize, [paragraph, second]); return true; });
  editor.commands.setTextSelection(5);
  toggleTextList(editor, "orderedList");
  const lists = editor.state.doc.content.content.filter((node) => node.type.name === "orderedList");
  assert.equal(lists[0].attrs.listIndent, "23px");
  assert.equal(lists[lists.length - 1].attrs.listIndent, "40px");
  assert.equal(editor.state.doc.textContent, "FirstBetweenFirst");
  editor.destroy();
});
