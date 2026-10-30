import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Extensions } from "@tiptap/react";
import { TEXT_ALIGNS } from "../../constants/style-values";
import { FontWeight } from "./font-weight";
import type { RichTextProfile } from "../../types/block";
import { ButtonDocument } from "./button-document";
import { ListStyle, StyledLink } from "./content-attributes";
import { ParagraphStyle } from "./paragraph-style";

interface RichTextPlaceholder {
  read: () => string;
  update: (value: string) => void;
}

// TipTap 的占位扩展在装饰计算时读取当前值；更新文案不替换编辑器或文档。
export function createRichTextPlaceholder(initial: string): RichTextPlaceholder {
  let current = initial;
  return { read: () => current, update: (value) => { current = value; } };
}

export function createRichTextExtensions(placeholder: string | (() => string), profile: RichTextProfile = "text"): Extensions {
  const button = profile === "button";
  const text = profile === "text";
  return [
    StarterKit.configure({
      document: button ? false : undefined,
      trailingNode: button ? false : undefined,
      link: false,
      bulletList: text ? undefined : false,
      orderedList: text ? undefined : false,
      listItem: text ? undefined : false,
      listKeymap: text ? undefined : false,
      strike: text ? undefined : false,
      hardBreak: button ? false : undefined,
      blockquote: false,
      code: false,
      codeBlock: false,
      heading: false,
      horizontalRule: false,
    }),
    TextStyleKit.configure({ backgroundColor: false, lineHeight: false }),
    FontWeight,
    ...(button ? [ButtonDocument] : [ParagraphStyle, StyledLink, TextAlign.configure({
      types: ["paragraph"],
      alignments: text ? Object.values(TEXT_ALIGNS) : [TEXT_ALIGNS.left, TEXT_ALIGNS.center, TEXT_ALIGNS.right],
    })]),
    ...(text ? [ListStyle] : []),
    Placeholder.configure({ placeholder }),
  ];
}
