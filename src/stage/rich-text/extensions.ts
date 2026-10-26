import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Extensions } from "@tiptap/react";
import { TEXT_ALIGNS } from "../../constants/style-values";
import { FontWeight } from "./font-weight";

export function createRichTextExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true },
      blockquote: false,
      code: false,
      codeBlock: false,
      heading: false,
      horizontalRule: false,
    }),
    TextStyleKit.configure({ backgroundColor: false, lineHeight: false }),
    FontWeight,
    TextAlign.configure({
      types: ["paragraph"],
      alignments: Object.values(TEXT_ALIGNS),
    }),
    Placeholder.configure({ placeholder }),
  ];
}
