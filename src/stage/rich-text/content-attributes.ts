import Link from "@tiptap/extension-link";
import { Extension } from "@tiptap/react";
import { cssColor, cssLength } from "../../utils/css-values";

export const StyledLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => cssColor(element.style.color, "") || null,
        renderHTML: (attrs: { color?: string }) => attrs.color ? { style: `color:${cssColor(attrs.color)}` } : {},
      },
      decoration: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.textDecoration === "none" ? "none" : element.style.textDecoration === "underline" ? "underline" : null,
        renderHTML: (attrs: { decoration?: string }) => attrs.decoration ? { style: `text-decoration:${attrs.decoration === "none" ? "none" : "underline"}` } : {},
      },
    };
  },
}).configure({ openOnClick: false, autolink: true });

export const ListStyle = Extension.create({
  name: "listStyle",
  addGlobalAttributes() {
    return [{
      types: ["bulletList", "orderedList"],
      attributes: {
        listSpacing: {
          default: null,
          parseHTML: (element: HTMLElement) => cssLength(element.style.marginTop, "") || null,
          renderHTML: (attrs: { listSpacing?: string }) => attrs.listSpacing ? { style: `margin:${cssLength(attrs.listSpacing)} 0` } : {},
        },
        listIndent: {
          default: null,
          parseHTML: (element: HTMLElement) => cssLength(element.style.paddingLeft, "") || null,
          renderHTML: (attrs: { listIndent?: string }) => attrs.listIndent ? { style: `padding-left:${cssLength(attrs.listIndent)}` } : {},
        },
      },
    }];
  },
});
