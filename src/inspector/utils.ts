import { HEX_COLOR } from "./constants";

export function colorInputValue(value: string, fallback = "#000000"): string {
  return HEX_COLOR.test(value) ? value : fallback;
}
