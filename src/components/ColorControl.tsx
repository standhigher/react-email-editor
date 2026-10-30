import { useEditorTranslation } from "../i18n/context";
import { ColorPicker } from "./ColorPicker";
import { colorToHex } from "./color-picker/colors";
import { useColorPicker } from "./color-picker/useColorPicker";

/** Color picker props. */
interface ColorControlProps {
  /** Current CSS color value. */
  value: string;
  /** Display fallback for an empty value, default #000000. */
  fallback?: string;
  /** Button and dialog label, default Color. */
  label?: string;
  /** Value submitted on reset; defaults to fallback. */
  resetTo?: string;
  /** Receive the selected or reset color. */
  onChange: (value: string) => void;
}

export function ColorControl({ value, fallback = "#000000", label: inputLabel, resetTo = fallback, onChange }: ColorControlProps) {
  const t = useEditorTranslation();
  const label = inputLabel ?? t("common.color");
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
