import { HEX_COLOR } from "../constants";
import { colorInputValue } from "../utils";

interface ColorControlProps {
  value: string;
  fallback?: string;
  allowEmpty?: boolean;
  onChange: (value: string) => void;
}

export function ColorControl({
  value,
  fallback = "#000000",
  allowEmpty = false,
  onChange,
}: ColorControlProps) {
  const inherited = allowEmpty && !HEX_COLOR.test(value);
  const display = colorInputValue(value, fallback);

  return (
    <div className="ree-color-row">
      <input
        type="color"
        value={display}
        onChange={(event) => onChange(event.target.value)}
        className="ree-color-input"
      />
      <span className="ree-color-value">{inherited ? "Default" : display}</span>
      {allowEmpty && !inherited ? (
        <button type="button" className="ree-color-reset" onClick={() => onChange("")}>
          Default
        </button>
      ) : null}
    </div>
  );
}
