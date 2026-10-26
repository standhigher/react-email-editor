import { HEX_COLOR } from "../constants";
import { colorInputValue } from "../utils";

interface ColorControlProps {
  value: string;
  fallback?: string;
  label?: string;
  onChange: (value: string) => void;
}

export function ColorControl({ value, fallback = "#000000", label = "Color", onChange }: ColorControlProps) {
  const actual = value || fallback;
  const empty = !actual || actual === "transparent" || !HEX_COLOR.test(actual);
  return (
    <label className="ree-color-chip">
      <span className="ree-color-swatch">
        <span
          className={`ree-color-swatch-face${empty ? " is-empty" : ""}`}
          style={empty ? undefined : { background: actual }}
        />
        <input
          type="color"
          className="ree-color-native"
          aria-label={label}
          value={colorInputValue(actual)}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      <span className="ree-color-chip-label">{label}</span>
    </label>
  );
}
