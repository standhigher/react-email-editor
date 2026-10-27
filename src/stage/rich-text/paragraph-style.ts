import { Extension } from "@tiptap/react";
import { cssLength, cssLineHeight } from "../../utils/css-values";

function lengthAttribute(value: string | null): string | null {
  const length = cssLength(value ?? "", "");
  return length || null;
}

function lineHeightAttribute(value: string | null): string | null {
  const lineHeight = cssLineHeight(value ?? "", "");
  return lineHeight || null;
}

/** 段落自己的段前距和行高。行高不进 textStyle，避免写到 span 上。 */
export const ParagraphStyle = Extension.create({
  name: "paragraphStyle",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          spacing: {
            default: null,
            parseHTML: (element: HTMLElement) => lengthAttribute(
              element.getAttribute("data-spacing") || element.style.getPropertyValue("--ree-paragraph-gap"),
            ),
            renderHTML: (attributes: { spacing?: string | null }) => {
              const spacing = lengthAttribute(attributes.spacing ?? null);
              if (!spacing) return {};
              return { "data-spacing": spacing, style: `--ree-paragraph-gap: ${spacing}` };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => lineHeightAttribute(
              element.getAttribute("data-line-height") || element.style.lineHeight,
            ),
            renderHTML: (attributes: { lineHeight?: string | null }) => {
              const lineHeight = lineHeightAttribute(attributes.lineHeight ?? null);
              if (!lineHeight) return {};
              return { "data-line-height": lineHeight, style: `line-height: ${lineHeight}` };
            },
          },
        },
      },
    ];
  },
});
