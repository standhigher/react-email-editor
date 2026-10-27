import { LINK_DECORATIONS } from "../constants/style-values";
import type { StyleFieldConfig } from "../types/block";
import { copyFontFamilies } from "../document/constants";
import { CONTENT_WIDTH_MAX, CONTENT_WIDTH_MIN, CONTENT_WIDTH_STEP } from "../constants/editor";
import { BORDER_STYLE, FONT_WEIGHT, TEXT_ALIGN } from "../blocks/style-fields";

interface GlobalFieldSection {
  title: string;
  fields: StyleFieldConfig[];
}

export const GLOBAL_FIELD_SECTIONS: GlobalFieldSection[] = [
  { title: "General", fields: [
    { id: "contentWidth", group: "general", label: "Content width", control: "range", min: CONTENT_WIDTH_MIN, max: CONTENT_WIDTH_MAX, step: CONTENT_WIDTH_STEP, unit: "px" },
    { id: "contentAlign", group: "general", label: "Content alignment", control: "alignment" },
  ] },
  { title: "Spacing", fields: [
    { id: "contentPadding", group: "dimension", label: "Content padding", control: "spacing" },
    { id: "outerPadding", group: "dimension", label: "Outer padding", control: "spacing" },
    { id: "blockGap", group: "dimension", label: "Block gap", control: "range", min: 0, max: 80, unit: "px" },
  ] },
  { title: "Decoration", fields: [
    { id: "backgroundColor", group: "decorations", label: "Background", control: "color" },
    { id: "contentBackgroundColor", group: "decorations", label: "Content", control: "color" },
    { id: "borderWidth", group: "decorations", label: "Border width", control: "range", min: 0, max: 12, unit: "px" },
    { ...BORDER_STYLE, id: "borderStyle", label: "Border style" },
    { id: "borderColor", group: "decorations", label: "Border", control: "color" },
    { id: "borderRadius", group: "decorations", label: "Corner radius", control: "corners", max: 48 },
  ] },
  { title: "Typography", fields: [
    { id: "fontFamily", group: "typography", label: "Font family", control: "select", options: copyFontFamilies() },
    { ...FONT_WEIGHT, id: "fontWeight" },
    { ...TEXT_ALIGN, id: "textAlign" },
    { id: "defaultFontSize", group: "typography", label: "Font size", control: "range", min: 8, max: 72, unit: "px" },
    { id: "defaultLineHeight", group: "typography", label: "Line height", control: "range", min: 1, max: 2.5, step: 0.05 },
    { id: "textColor", group: "typography", label: "Text", control: "color" },
    { id: "paragraphSpacing", group: "typography", label: "Paragraph spacing", control: "range", min: 0, max: 48, unit: "px" },
    { id: "listSpacing", group: "typography", label: "List spacing", control: "range", min: 0, max: 48, unit: "px" },
    { id: "listIndent", group: "typography", label: "List indent", control: "range", min: 0, max: 64, unit: "px" },
    { id: "linkColor", group: "typography", label: "Link", control: "color" },
    { id: "linkDecoration", group: "typography", label: "Link decoration", control: "select", options: [{ label: "Underline", value: LINK_DECORATIONS.underline }, { label: "None", value: LINK_DECORATIONS.none }] },
  ] },
];
