import { BORDER_STYLES, isStyleValue, type BorderStyle } from "../constants/style-values";

/** 仅接受配置控件支持的 CSS 值；保留 0、透明色和继承值的语义。 */
export function cssLength(value: unknown, fallback = "0px", allowAuto = false): string {
  const input = String(value ?? "").trim();
  if (allowAuto && input === "auto") return input;
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|em|rem|%)?$/.test(input)) return fallback;
  return /[a-z%]$/i.test(input) ? input : `${input}px`;
}

export function cssSpacing(value: unknown, fallback = "0px"): string {
  const parts = String(value ?? "").trim().split(/\s+/);
  if (parts.length > 4 || parts.some((part) => !cssLength(part, ""))) return fallback;
  return parts.map((part) => cssLength(part)).join(" ");
}

/** 圆角只接受 1 个或 4 个长度。两个值在圆角里是对角，不能按间距的上下/左右展开。 */
export function cssCornerRadius(value: unknown, fallback = "0px"): string {
  const parts = String(value ?? "").trim().split(/\s+/).filter(Boolean);
  if ((parts.length !== 1 && parts.length !== 4) || parts.some((part) => !cssLength(part, ""))) return fallback;
  return parts.map((part) => cssLength(part)).join(" ");
}

/** 展开成左上、右上、右下、左下。单值复制到四角。 */
export function cornerRadii(value: string): string[] {
  const parts = cssCornerRadius(value).split(/\s+/);
  const topLeft = parts[0] ?? "0px";
  if (parts.length === 1) return [topLeft, topLeft, topLeft, topLeft];
  return [parts[0] ?? topLeft, parts[1] ?? topLeft, parts[2] ?? topLeft, parts[3] ?? topLeft];
}

/** 单元格高度只接受正的 px。0 和其它单位视为没设置。 */
export function cssPx(value: unknown): string | undefined {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(cssLength(value, ""));
  if (!match) return undefined;
  const px = String(Math.round(Number(match[1])));
  return px === "0" ? undefined : px;
}

export function spacingSides(value: string): string[] {
  const [top = "0px", right = top, bottom = top, left = right] = cssSpacing(value).split(/\s+/);
  return [top, right, bottom, left];
}

export function cssColor(value: unknown, fallback = "transparent"): string {
  const input = String(value ?? "").trim();
  return /^(?:#[\da-f]{3,8}|transparent|[a-z]+|rgba?\([\d.,%\s]+\)|hsla?\([\d.,%\s]+\))$/i.test(input) ? input : fallback;
}

export function cssFont(value: unknown, fallback: string): string {
  const input = String(value ?? "").trim();
  return input && !/[;<>{}\\]/.test(input) ? input : fallback;
}

export interface CssLengthValue {
  amount: number;
  unit: string;
}

const EMAIL_EM_PX = 16;

/** 读出数值和单位。em/rem 在邮件客户端不稳定，展示时按 16px 折成 px。 */
export function readCssLength(value: string, units: string[] = []): CssLengthValue {
  const input = value.trim();
  const allowed = units.filter((unit) => unit !== "auto");
  const fallbackUnit = allowed[0] ?? "";
  if (input === "auto" && units.includes("auto")) return { amount: 0, unit: "auto" };
  const match = input.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|em|rem|%)?$/i);
  if (!match) return { amount: 0, unit: fallbackUnit };
  let amount = Number(match[1]);
  let unit = (match[2] ?? "").toLowerCase();
  if (unit === "em" || unit === "rem") {
    amount = Math.round(amount * EMAIL_EM_PX);
    unit = "px";
  }
  if (!unit) unit = fallbackUnit;
  if (allowed.length > 0 && !allowed.includes(unit)) unit = fallbackUnit;
  return { amount: Number.isFinite(amount) ? amount : 0, unit };
}

export function formatCssLength(amount: number, unit: string): string {
  if (unit === "auto") return "auto";
  const text = Number.isInteger(amount) ? String(amount) : String(Number(amount.toFixed(2)));
  return unit ? `${text}${unit}` : text;
}

export function cssLineHeight(value: unknown, fallback: string): string {
  const input = String(value ?? "").trim();
  return /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(input) ? input : cssLength(input, fallback);
}

export function cssBorderStyle(value: unknown): BorderStyle {
  return isStyleValue(BORDER_STYLES, value) ? value : BORDER_STYLES.solid;
}
