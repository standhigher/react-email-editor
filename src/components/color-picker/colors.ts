import { HEX_COLOR } from "../../constants/style-values";

export interface HsvColor {
  hue: number;
  saturation: number;
  brightness: number;
}

export function normalizeHex(value: string): string | null {
  const input = value.trim();
  const hex = input.startsWith("#") ? input : `#${input}`;
  if (!HEX_COLOR.test(hex)) return null;
  const digits = hex.slice(1).toLowerCase();
  return `#${digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits}`;
}

/** TipTap 读取内联样式时可能将 HEX 转成 rgb()。 */
export function colorToHex(value: string): string | null {
  const hex = normalizeHex(value);
  if (hex) return hex;
  const rgb = /^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i.exec(value.trim());
  if (!rgb) return null;
  const channels = rgb.slice(1).map(Number);
  if (channels.some((channel) => !Number.isFinite(channel) || channel < 0 || channel > 255)) return null;
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

export function hexToHsv(hex: string): HsvColor {
  const normalized = normalizeHex(hex) ?? "#000000";
  const [red, green, blue] = [1, 3, 5].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
  }
  return { hue: (hue * 60 + 360) % 360, saturation: max ? delta / max * 100 : 0, brightness: max * 100 };
}

export function hsvToHex({ hue, saturation, brightness }: HsvColor): string {
  const sector = ((hue % 360) + 360) % 360 / 60;
  const value = Math.min(100, Math.max(0, brightness)) / 100;
  const chroma = value * Math.min(100, Math.max(0, saturation)) / 100;
  const secondary = chroma * (1 - Math.abs(sector % 2 - 1));
  const channels = sector < 1 ? [chroma, secondary, 0]
    : sector < 2 ? [secondary, chroma, 0]
    : sector < 3 ? [0, chroma, secondary]
    : sector < 4 ? [0, secondary, chroma]
    : sector < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
  return `#${channels.map((channel) => Math.round((channel + value - chroma) * 255).toString(16).padStart(2, "0")).join("")}`;
}
