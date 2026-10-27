import { ColorPicker } from "./ColorPicker";
import { colorToHex } from "./color-picker/colors";
import { useColorPicker } from "./color-picker/useColorPicker";

interface ColorControlProps {
  value: string;
  fallback?: string;
  label?: string;
  resetTo?: string;
  onChange: (value: string) => void;
}

export function ColorControl({ value, fallback = "#000000", label = "Color", resetTo = fallback, onChange }: ColorControlProps) {
  const { id, open, anchorRef, panelRef, toggle, close } = useColorPicker();
  const actual = value || fallback;
  const normalized = colorToHex(actual);
  const empty = normalized === null;
  return (
    <div className="ree-color-control" ref={anchorRef}>
      <button
        type="button"
        className="ree-color-chip"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={toggle}
      >
        <span className="ree-color-swatch">
          <span
            className={`ree-color-swatch-face${empty ? " is-empty" : ""}`}
            style={normalized ? { background: normalized } : undefined}
          />
        </span>
        <span className="ree-color-chip-label">{label}</span>
      </button>
      {open ? <ColorPicker id={id} label={label} value={actual} fallback={fallback} panelRef={panelRef} onChange={onChange} onReset={() => onChange(resetTo)} onClose={close} /> : null}
    </div>
  );
}
