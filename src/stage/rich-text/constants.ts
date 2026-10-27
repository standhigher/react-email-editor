import { TEXT_ALIGNS as TEXT_ALIGN_VALUES, type TextAlign } from "../../constants/style-values";

export interface TextAlignOption {
  value: TextAlign;
  title: string;
  icon: "align-left" | "align-center" | "align-right" | "align-justify";
}

export const PARAGRAPH_SPACING_MAX = 48;

export const DEFAULT_LINK_TARGET = "_blank";

export const LINK_TARGETS = [
  { value: "_self", label: "Current page" },
  { value: "_blank", label: "New page" },
];

export const LINE_HEIGHT_RANGE = { min: 1, max: 2.5, step: 0.05 } as const;

export const FONT_SIZES = [
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
];

export const EMOJIS = [
  "😀",
  "😁",
  "😂",
  "😊",
  "😍",
  "😎",
  "😉",
  "😢",
  "👍",
  "👎",
  "🙏",
  "👏",
  "🎉",
  "🔥",
  "❤️",
  "⭐",
  "✅",
  "✨",
  "📦",
  "🚚",
  "🎁",
  "💡",
  "📣",
  "🛒",
  "💰",
  "🏷️",
  "⏰",
  "📅",
  "📍",
  "✉️",
  "🔗",
  "👀",
];

export const TEXT_ALIGNS: TextAlignOption[] = [
  { value: TEXT_ALIGN_VALUES.left, title: "Align left", icon: "align-left" },
  { value: TEXT_ALIGN_VALUES.center, title: "Align center", icon: "align-center" },
  { value: TEXT_ALIGN_VALUES.right, title: "Align right", icon: "align-right" },
  { value: TEXT_ALIGN_VALUES.justify, title: "Justify", icon: "align-justify" },
];
