import type { CSSProperties } from "react";
import { blockContentStyle } from "../../utils/style";
import { cssPx } from "../../utils/css-values";
import { contentVariables } from "../../render/content-style";
import type { EmailBlockNode, EmailBodySettings } from "../../types/document";

export function canvasBlockStyle(block: EmailBlockNode, body: EmailBodySettings): CSSProperties {
  const height = cssPx(block.style?.dimension?.height);
  return {
    ...blockContentStyle(block.style, body),
    ...contentVariables(block.style, body),
    // 表格单元格的 height 是最小高度。画布用同样的 border-box min-height，内容再高时两边都会撑开。
    ...(height ? { boxSizing: "border-box", minHeight: `${height}px` } : {}),
  };
}
