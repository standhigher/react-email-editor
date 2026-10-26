export interface TextAlignOption {
  value: "left" | "center" | "right" | "justify";
  title: string;
  icon: "align-left" | "align-center" | "align-right" | "align-justify";
}

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

export const TEXT_COLORS = [
  "#202223",
  "#303030",
  "#6d7175",
  "#d72c0d",
  "#b98900",
  "#008060",
  "#005bd3",
  "#6d28d9",
  "#ffffff",
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
  { value: "left", title: "Align left", icon: "align-left" },
  { value: "center", title: "Align center", icon: "align-center" },
  { value: "right", title: "Align right", icon: "align-right" },
  { value: "justify", title: "Justify", icon: "align-justify" },
];
