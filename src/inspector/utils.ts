import { HEX_COLOR } from "./constants";

export function colorInputValue(value: string): string {
  return HEX_COLOR.test(value) ? value : "#000000";
}
