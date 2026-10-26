import type { EditorDevice } from "../types/editor";

export const SUBJECT_MAX_LENGTH = 128;

export const DRAG_ACTIVATION_DISTANCE = 6;

export const CANVAS_DROP_ID = "canvas";

export const CANVAS_DEVICE_WIDTH: Record<EditorDevice, number> = {
  desktop: 600,
  mobile: 360,
};

export const CONTENT_WIDTH_MIN = 320;
export const CONTENT_WIDTH_MAX = 900;
export const CONTENT_WIDTH_STEP = 10;

/** Shared email surface width for the canvas card and the preview iframe. */
export function emailViewportWidth(
  device: EditorDevice,
  contentWidth = CANVAS_DEVICE_WIDTH.desktop,
): number {
  if (device === "mobile") return CANVAS_DEVICE_WIDTH.mobile;
  const width = Number.isFinite(contentWidth) ? contentWidth : CANVAS_DEVICE_WIDTH.desktop;
  return Math.min(CONTENT_WIDTH_MAX, Math.max(CONTENT_WIDTH_MIN, width));
}
