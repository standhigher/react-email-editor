import { Extension } from "@tiptap/react";
import { FONT_WEIGHTS, isStyleValue, type FontWeight as EmailFontWeight } from "../../constants/style-values";

function parseFontWeight(value: string): EmailFontWeight | null {
  const weight = value.trim().toLowerCase();
  return isStyleValue(FONT_WEIGHTS, weight) ? weight : null;
}

export const FontWeight = Extension.create({
  name: "fontWeight",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontWeight: {
            default: null,
            parseHTML: (element: HTMLElement) => parseFontWeight(element.style.fontWeight),
            renderHTML: (attributes: { fontWeight?: string | null }) => {
              if (attributes.fontWeight !== FONT_WEIGHTS.normal && attributes.fontWeight !== FONT_WEIGHTS.bold) {
                return {};
              }
              return { style: `font-weight: ${attributes.fontWeight}` };
            },
          },
        },
      },
    ];
  },
});
