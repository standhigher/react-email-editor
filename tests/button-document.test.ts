import assert from "node:assert/strict";
import test from "node:test";
import { Editor } from "@tiptap/react";
import { Fragment, Slice } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import { ButtonDocument } from "../src/stage/rich-text/button-document.ts";

test("按钮单段 schema 阻止分段，粘贴多段保留文案与粗体", () => {
  const editor = new Editor({
    element: null,
    extensions: [StarterKit.configure({ document: false, link: false, bulletList: false, orderedList: false, listItem: false, listKeymap: false, hardBreak: false, strike: false }), ButtonDocument],
    content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Buy" }] }] },
  });
  assert.equal(editor.commands.splitBlock(), false);
  const { schema } = editor;
  const paragraphs = [
    schema.nodes.paragraph.create(null, schema.text("First", [schema.marks.bold.create()])),
    schema.nodes.paragraph.create(null, schema.text("Second")),
  ];
  let slice = new Slice(Fragment.from(paragraphs), 0, 0);
  for (const plugin of editor.extensionManager.plugins) {
    if (plugin.props.transformPasted) slice = plugin.props.transformPasted.call(plugin, slice, editor.view, false);
  }
  assert.equal(slice.content.textBetween(0, slice.content.size), "First Second");
  assert.equal(slice.content.firstChild?.marks[0]?.type.name, "bold");
  assert.equal(slice.content.firstChild?.isText, true);
  editor.commands.command(({ tr }) => { tr.replaceSelection(slice); return true; });
  assert.equal(editor.state.doc.childCount, 1);
  assert.equal(editor.state.doc.textContent, "First SecondBuy");
  editor.destroy();
});
