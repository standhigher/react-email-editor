import type { Editor } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

type ListType = "bulletList" | "orderedList";

interface ListRange {
  node: ProseMirrorNode;
  from: number;
  to: number;
}

function isList(node: ProseMirrorNode): boolean {
  return node.type.name === "bulletList" || node.type.name === "orderedList";
}

/** 列表转换保留每个列表的属性，自动整块操作不包含末尾辅助空段。 */
export function toggleTextList(editor: Editor, type: ListType): boolean {
  return editor.chain().focus().command(({ tr, chain }) => {
    const selection = tr.selection;
    const bookmark = selection.getBookmark();
    const storedMarks = tr.storedMarks;
    const from = selection.empty ? 0 : selection.from;
    let to = selection.empty ? tr.doc.content.size : selection.to;
    const last = tr.doc.lastChild;
    if (selection.empty && tr.doc.childCount > 1 && last?.type.name === "paragraph" && last.content.size === 0) {
      const previous = tr.doc.child(tr.doc.childCount - 2);
      if (isList(previous)) to -= last.nodeSize;
    }
    const lists: ListRange[] = [];
    const paragraphs: ListRange[] = [];
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (isList(node)) {
        lists.push({ node, from: pos, to: pos + node.nodeSize });
        return false;
      }
      if (node.type.name === "paragraph") {
        const previous = paragraphs[paragraphs.length - 1];
        if (previous?.to === pos) previous.to = pos + node.nodeSize;
        else paragraphs.push({ node, from: pos, to: pos + node.nodeSize });
        return false;
      }
    });
    const remove = lists.length > 0 && paragraphs.length === 0 && lists.every((item) => item.node.type.name === type);
    if (remove) {
      for (const list of lists.reverse()) {
        const start = selection.empty ? list.from + 1 : Math.max(selection.from, list.from + 1);
        const end = selection.empty ? list.to - 1 : Math.min(selection.to, list.to - 1);
        tr.setSelection(TextSelection.between(tr.doc.resolve(start), tr.doc.resolve(end)));
        chain().liftListItem("listItem").run();
      }
    } else {
      const target = editor.schema.nodes[type];
      for (const list of lists) {
        if (list.node.type !== target) tr.setNodeMarkup(list.from, target, list.node.attrs);
      }
      for (const paragraph of paragraphs.reverse()) {
        chain().setTextSelection({ from: paragraph.from + 1, to: paragraph.to - 1 }).wrapInList(type).run();
      }
    }
    tr.setSelection(bookmark.map(tr.mapping).resolve(tr.doc));
    if (tr.selection.empty) tr.setStoredMarks(storedMarks);
    return true;
  }).run();
}
