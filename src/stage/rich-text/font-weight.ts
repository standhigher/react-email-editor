import { Extension } from "@tiptap/react";

function parseFontWeight(value: string): "normal" | "bold" | null {
  const weight = value.trim().toLowerCase();
  if (weight === "normal" || weight === "400") return "normal";
  if (weight === "bold" || weight === "700") return "bold";
  return null;
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
              if (attributes.fontWeight !== "normal" && attributes.fontWeight !== "bold") {
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
