import type { CSSProperties } from "react";
import type { EditorDevice } from "../types/editor";
import { emailViewportWidth } from "../constants/editor";
import { spacingSides } from "../utils/css-values";
import type { EmailGlobalSettings } from "../types/document";
import { decorationStyle } from "../utils/style";

export function surfaceStyle(global: EmailGlobalSettings): CSSProperties {
  return {
    ...decorationStyle({
      backgroundColor: global.contentBackgroundColor,
      borderWidth: global.borderWidth,
      borderStyle: global.borderStyle,
      borderColor: global.borderColor,
      borderRadius: global.borderRadius,
    }),
    padding: global.contentPadding,
  };
}

/** 桌面内容宽度不包含外侧留白；移动端固定设备视口，内容随可用空间收缩。 */
export function viewportWidth(device: EditorDevice, global: EmailGlobalSettings): string {
  const width = emailViewportWidth(device, global.contentWidth);
  if (device === "mobile") return `${width}px`;
  const [, right, , left] = spacingSides(global.outerPadding);
  const sides = [left, right];
  const ratio = sides.reduce((total, side) => total + (side.endsWith("%") ? parseFloat(side) / 100 : 0), 0);
  const lengths = sides.filter((side) => !side.endsWith("%"));
  const sum = [`${width}px`, ...lengths].join(" + ");
  return ratio < 1 ? `calc((${sum}) / ${1 - ratio})` : `${width}px`;
}
