import { useRef } from "react";
import { toColorInputValue } from "../utils";

interface ColorMenuProps {
  colors: string[];
  value: string;
  fallback: string;
  onSelect: (color: string) => void;
  onClear: () => void;
}

export function ColorMenu({ colors, value, fallback, onSelect, onClear }: ColorMenuProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="ree-rte-swatches">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`ree-rte-swatch${sameColor(color, value) ? " is-active" : ""}`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={color}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
      <div className="ree-rte-color-actions">
        <button type="button" className="ree-btn" onClick={onClear}>
          Default
        </button>
        <button type="button" className="ree-btn" onClick={() => inputRef.current?.click()}>
          Custom
        </button>
        <input
          ref={inputRef}
          className="ree-rte-color-input"
          type="color"
          tabIndex={-1}
          value={toColorInputValue(value, fallback)}
          onChange={(event) => onSelect(event.target.value)}
        />
      </div>
    </div>
  );
}

function sameColor(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}
