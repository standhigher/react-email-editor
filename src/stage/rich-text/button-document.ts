import { Node } from "@tiptap/react";
import { Fragment, Slice, type Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin } from "@tiptap/pm/state";

/** 按钮只允许单段行内内容；粘贴多个段落时保留文字与基础格式，用空格连接。 */
export const ButtonDocument = Node.create({
  name: "doc",
  topNode: true,
  content: "paragraph",
  addKeyboardShortcuts() {
    return { Enter: () => true, "Shift-Enter": () => true };
  },
  addProseMirrorPlugins() {
    return [new Plugin({
      props: {
        transformPasted(slice) {
          const nodes: ProseMirrorNode[] = [];
          slice.content.descendants((node) => {
            if (node.isTextblock && nodes.length) nodes.push(node.type.schema.text(" "));
            if (node.isText) nodes.push(node);
          });
          return new Slice(Fragment.from(nodes), 0, 0);
        },
      },
    })];
  },
});
