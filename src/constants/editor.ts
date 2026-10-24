import type { EditorDevice } from "../types/editor";

export const SUBJECT_MAX_LENGTH = 128;

export const DRAG_ACTIVATION_DISTANCE = 6;

export const CANVAS_DROP_ID = "canvas";

export const CANVAS_DEVICE_WIDTH: Record<EditorDevice, number> = {
  desktop: 600,
  mobile: 375,
};
