import type { StyleControlConfig } from "../types/block";
import { CONTENT_WIDTH_MAX, CONTENT_WIDTH_MIN, CONTENT_WIDTH_STEP } from "../constants/editor";
import { BORDER_STYLE, FONT_WEIGHT } from "../blocks/style-controls";
import { copyFontFamilies } from "../document/constants";

interface BodyControlSection {
  title: string;
  controls: StyleControlConfig[];
  advancedControls?: StyleControlConfig[];
}

export const BODY_CONTROL_SECTIONS: BodyControlSection[] = [
  { title: "General", controls: [
    { id: "textColor", group: "typography", label: "Text color", control: "color" },
    { id: "linkColor", group: "typography", label: "Link color", control: "color" },
    { id: "fontFamily", group: "typography", label: "Font family", control: "select", options: [{ label: "Default", value: "" }, ...copyFontFamilies()] },
    { ...FONT_WEIGHT, id: "fontWeight", label: "Font weight" },
  ] },
  { title: "Content", controls: [
    { id: "backgroundColor", group: "decorations", label: "Background", control: "color" },
    { id: "contentWidth", group: "general", label: "Content width", control: "range", min: CONTENT_WIDTH_MIN, max: CONTENT_WIDTH_MAX, step: CONTENT_WIDTH_STEP, unit: "px" },
    { id: "contentPadding", group: "dimension", label: "Padding", control: "spacing" },
    { id: "blockGap", group: "dimension", label: "Block gap", control: "range", min: 0, max: 80, unit: "px" },
  ], advancedControls: [
    { id: "borderColor", group: "decorations", label: "Border color", control: "color" },
    { id: "borderWidth", group: "decorations", label: "Border width", control: "range", min: 0, max: 12, unit: "px" },
    { ...BORDER_STYLE, id: "borderStyle", label: "Border style" },
  ] },
];
