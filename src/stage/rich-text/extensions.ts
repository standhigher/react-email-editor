import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Extensions } from "@tiptap/react";
import { FontWeight } from "./font-weight";

const LIST_STYLE = "margin:0.25em 0;padding-left:1.4em;";

export function createRichTextExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true },
      blockquote: false,
      bulletList: { HTMLAttributes: { style: LIST_STYLE } },
      code: false,
      codeBlock: false,
      heading: false,
      horizontalRule: false,
      orderedList: { HTMLAttributes: { style: LIST_STYLE } },
    }),
    TextStyleKit.configure({ backgroundColor: false, lineHeight: false }),
    FontWeight,
    TextAlign.configure({
      types: ["paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    Placeholder.configure({ placeholder }),
  ];
}
