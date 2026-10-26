import type { EditorDevice } from "../types/editor";

export const SUBJECT_MAX_LENGTH = 128;

export const DRAG_ACTIVATION_DISTANCE = 6;

export const CANVAS_DROP_ID = "canvas";

export const CANVAS_DEVICE_WIDTH: Record<EditorDevice, number> = {
  desktop: 600,
  mobile: 360,
};

/** 邮件栏左右留白。编辑区卡片和预览文档用同一个值，避免一边被 padding 挤窄、另一边被撑宽。 */
export const EMAIL_COLUMN_PADDING_X = 24;

export const CONTENT_WIDTH_MIN = 320;
export const CONTENT_WIDTH_MAX = 900;
export const CONTENT_WIDTH_STEP = 10;

/** Shared inbox frame for the canvas card and the preview iframe. */
export function emailViewportWidth(device: EditorDevice): number {
  if (device === "mobile") return CANVAS_DEVICE_WIDTH.mobile;
  return CONTENT_WIDTH_MAX + EMAIL_COLUMN_PADDING_X * 2;
}

export function contentColumnWidth(
  device: EditorDevice,
  contentWidth: number,
): number {
  const available = emailViewportWidth(device) - EMAIL_COLUMN_PADDING_X * 2;
  if (!Number.isFinite(contentWidth)) return available;
  return Math.min(contentWidth, available);
}
