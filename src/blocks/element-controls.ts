import { HORIZONTAL_ALIGNS } from "../constants/style-values";
import type { TranslatableStyleControl } from "../i18n/types";
import type { EmailElementStyle } from "../types/document";
import { BORDER_STYLE_OPTIONS, createDecorationControls, createDimensionControls } from "./style-controls";

const elementDecoration = createDecorationControls({
  borderWidth: { id: "element.borderWidth", label: "Border width" },
  borderStyle: { id: "element.borderStyle", label: "Border style" },
  borderColor: { id: "element.borderColor", label: "Outline" },
  borderRadius: { id: "element.borderRadius", label: "Corner radius" },
});
/** 按钮盒子的初始外观。重置和缺省渲染都回到这组值，而不是透明底。 */
export const BUTTON_BOX_DEFAULTS = {
  align: HORIZONTAL_ALIGNS.center,
  backgroundColor: "#000000",
  borderRadius: "8px",
  borderWidth: "1px",
  borderColor: "transparent",
  padding: "12px 32px",
} as const satisfies EmailElementStyle;

export const ELEMENT_BORDER_CONTROLS: TranslatableStyleControl[] = [
  { ...elementDecoration.borderWidth, labelKey: "common.borderWidth" },
  { ...elementDecoration.borderStyle, labelKey: "common.borderStyle", options: BORDER_STYLE_OPTIONS },
  { ...elementDecoration.borderColor, labelKey: "common.outline" },
  { ...elementDecoration.borderRadius, labelKey: "common.radius" },
];
export const ELEMENT_ALIGN: TranslatableStyleControl = { id: "element.align", group: "general", label: "Alignment", labelKey: "common.align", control: "alignment", defaultValue: HORIZONTAL_ALIGNS.center };
export const ELEMENT_WIDTH: TranslatableStyleControl = { id: "element.width", group: "general", label: "Width", labelKey: "common.width", control: "range", units: ["px", "%", "auto"], min: 0, max: 600, defaultValue: "auto" };
export const BUTTON_STYLE_CONTROLS: TranslatableStyleControl[] = [
  ELEMENT_ALIGN, ELEMENT_WIDTH,
  { ...createDimensionControls({ padding: { id: "element.padding", label: "Button padding", defaultValue: BUTTON_BOX_DEFAULTS.padding } }).padding, labelKey: "inspector.buttonPadding" },
  { ...createDecorationControls({ backgroundColor: { id: "element.backgroundColor", label: "Button fill", defaultValue: BUTTON_BOX_DEFAULTS.backgroundColor } }).backgroundColor, labelKey: "inspector.buttonFill" },
  ...ELEMENT_BORDER_CONTROLS.map((control) => ({
    ...control,
    defaultValue: control.id === "element.borderWidth" ? BUTTON_BOX_DEFAULTS.borderWidth
      : control.id === "element.borderColor" ? BUTTON_BOX_DEFAULTS.borderColor
        : control.id === "element.borderRadius" ? BUTTON_BOX_DEFAULTS.borderRadius
          : control.defaultValue,
  })),
];
export const IMAGE_STYLE_CONTROLS: TranslatableStyleControl[] = [
  ELEMENT_WIDTH,
  { id: "element.height", group: "general", label: "Height", labelKey: "common.height", control: "range", units: ["px", "auto"], min: 0, max: 480, defaultValue: "auto" },
  ...ELEMENT_BORDER_CONTROLS,
];
export const DIVIDER_STYLE_CONTROLS: TranslatableStyleControl[] = [
  ELEMENT_ALIGN, { ...ELEMENT_WIDTH, units: ["px", "%"], defaultValue: "100%" },
  { ...ELEMENT_BORDER_CONTROLS[0], label: "Line thickness", labelKey: "inspector.lineWidth", defaultValue: "1px" },
  { ...ELEMENT_BORDER_CONTROLS[1], label: "Line style", labelKey: "inspector.lineStyle" },
];
