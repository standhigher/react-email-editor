import { useState, type RefObject } from "react";
import { RangeControl } from "./RangeControl";
import { TextInput } from "./TextInput";
import { ResetButton } from "./ResetButton";
import { ColorSaturation } from "./color-picker/ColorSaturation";
import { colorToHex, hexToHsv, hsvToHex, normalizeHex, type HsvColor } from "./color-picker/colors";

interface ColorPickerProps {
  id: string;
  label: string;
  value: string;
  fallback?: string;
  panelRef: RefObject<HTMLDivElement>;
  onChange: (value: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ColorPicker({ id, label, value, fallback = "#000000", panelRef, onChange, onReset, onClose }: ColorPickerProps) {
  const initial = colorToHex(value) ?? colorToHex(fallback) ?? "#000000";
  const [color, setColor] = useState(() => hexToHsv(initial));
  const [draft, setDraft] = useState(initial);
  const invalid = !normalizeHex(draft);
  const selectColor = (next: HsvColor) => {
    const hex = hsvToHex(next);
    setColor(next);
    setDraft(hex);
    onChange(hex);
  };
  const commitHex = () => {
    const hex = normalizeHex(draft);
    if (!hex) return;
    setDraft(hex);
  };

  return (
    <div
      ref={panelRef}
      id={id}
      className="ree-color-picker"
      role="dialog"
      aria-label={`${label} picker`}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <ColorSaturation color={color} onChange={selectColor} />
      <div className="ree-color-hue">
        <RangeControl label="Hue" value={color.hue} min={0} max={360} onChange={(hue) => selectColor({ ...color, hue })} />
      </div>
      <div className="ree-color-hex-row">
        <span className="ree-color-preview" style={{ backgroundColor: hsvToHex(color) }} />
        <label className="ree-color-hex-field">
          <span>HEX</span>
          <TextInput
            aria-label="HEX"
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            value={draft}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              const hex = normalizeHex(next);
              if (hex) {
                setColor(hexToHsv(hex));
                onChange(hex);
              }
            }}
            onBlur={commitHex}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              event.stopPropagation();
              commitHex();
            }}
          />
        </label>
        <ResetButton label={`Reset ${label.toLowerCase()}`} onClick={() => {
          onReset();
          onClose();
        }} />
      </div>
      {invalid ? <p id={`${id}-error`} className="ree-color-error" role="status">Enter a 3 or 6 digit HEX color.</p> : null}
    </div>
  );
}
