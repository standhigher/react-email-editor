import type { EmailGlobalSettings } from "../types/document";
import { HEX_COLOR } from "./constants";

export function colorInputValue(value: string, fallback = "#000000"): string {
  return HEX_COLOR.test(value) ? value : fallback;
}

export interface StyleResetState {
  resetTo: string;
  show: boolean;
}

/** 排版项重置为继承全局；其余项写回区块默认，避免删掉后落到透明或 0。 */
export function styleReset(stored: string, restore: string, inherit: boolean): StyleResetState {
  if (inherit) return { resetTo: "", show: stored !== "" };
  return { resetTo: restore, show: stored !== "" && stored !== restore };
}

export function inheritedStyleValue(id: string, global: EmailGlobalSettings): string | undefined {
  if (!id.startsWith("typography.") && !id.startsWith("element.")) return;
  switch (id.split(".")[1]) {
    case "fontFamily": return global.fontFamily;
    case "fontSize": return global.defaultFontSize;
    case "fontWeight": return global.fontWeight;
    case "lineHeight": return global.defaultLineHeight;
    case "color": return global.textColor;
    case "textAlign": return global.textAlign;
    case "paragraphSpacing": return global.paragraphSpacing;
    case "listSpacing": return global.listSpacing;
    case "listIndent": return global.listIndent;
    case "linkColor": return global.linkColor;
    case "linkDecoration": return global.linkDecoration;
  }
}
