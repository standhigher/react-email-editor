import { typographyWithBody } from "../utils/typography";
import { cssLength } from "../utils/css-values";

import type { StyleControlConfig } from "../types/block";
import type { EmailBodySettings } from "../types/document";

/** 同一层边框没有宽度时收起颜色和线型；圆角仍可影响背景与图片。 */
export function visibleStyleControls(
  controls: StyleControlConfig[],
  readValue: (id: string) => string | undefined,
): StyleControlConfig[] {
  return controls.filter((control) => {
    const prefix = control.id.slice(0, control.id.lastIndexOf(".") + 1);
    const name = control.id.slice(prefix.length);
    if (name !== "borderColor" && name !== "borderStyle") return true;
    const width = readValue(`${prefix}borderWidth`);
    // 未声明宽度的自定义控件保留原有展示，不推断其渲染方式。
    return width === undefined || parseFloat(cssLength(width)) > 0;
  });
}

export interface StyleResetState {
  resetTo: string;
  show: boolean;
}

/** 排版项重置为继承主体默认排版；其余项写回区块默认，避免删掉后落到透明或 0。 */
export function styleReset(stored: string, restore: string, inherit: boolean): StyleResetState {
  if (inherit) return { resetTo: "", show: stored !== "" };
  return { resetTo: restore, show: stored !== "" && stored !== restore };
}

export function inheritedStyleValue(id: string, body: EmailBodySettings): string | undefined {
  if (!id.startsWith("typography.") && !id.startsWith("element.")) return;
  const defaults = typographyWithBody(body);
  switch (id.split(".")[1]) {
    case "fontFamily": return defaults.fontFamily;
    case "fontSize": return defaults.fontSize;
    case "fontWeight": return defaults.fontWeight;
    case "lineHeight": return defaults.lineHeight;
    case "color": return defaults.color;
    case "textAlign": return defaults.textAlign;
    case "paragraphSpacing": return defaults.paragraphSpacing;
    case "listSpacing": return defaults.listSpacing;
    case "listIndent": return defaults.listIndent;
    case "linkColor": return defaults.linkColor;
    case "linkDecoration": return defaults.linkDecoration;
  }
}
