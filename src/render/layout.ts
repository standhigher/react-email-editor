import type { CSSProperties } from "react";
import type { EditorDevice } from "../types/editor";
import { emailViewportWidth } from "../constants/editor";
import type { EmailBodySettings } from "../types/document";
import { decorationStyle, typographyStyle } from "../utils/style";

export function surfaceStyle(body: EmailBodySettings): CSSProperties {
  return {
    ...typographyStyle(undefined, body),
    ...decorationStyle({
      backgroundColor: body.backgroundColor,
      borderWidth: body.borderWidth,
      borderStyle: body.borderStyle,
      borderColor: body.borderColor,
    }),
    padding: body.contentPadding,
  };
}

/** 桌面使用内容宽度；移动端固定设备视口，内容随可用空间收缩。 */
export function viewportWidth(device: EditorDevice, body: EmailBodySettings): string {
  return `${emailViewportWidth(device, body.contentWidth)}px`;
}
