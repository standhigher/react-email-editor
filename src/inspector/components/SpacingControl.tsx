import { useState } from "react";
import { readCssLength, spacingSides } from "../../utils/css-values";
import { SPACING_MAX, SPACING_SIDES } from "../constants";
import { RangeControl } from "./RangeControl";

interface SpacingControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function sideAmount(value: string): number {
  return Math.min(SPACING_MAX, Math.max(0, readCssLength(value, ["px"]).amount));
}

export function SpacingControl({ label, value, onChange }: SpacingControlProps) {
  const sides = spacingSides(value);
  const equal = sides.every((side) => sideAmount(side) === sideAmount(sides[0]));
  const [independent, setIndependent] = useState(!equal);
  const slider = (sideLabel: string, sideValue: string, commit: (next: string) => void) => {
    const amount = sideAmount(sideValue);
    return (
      <div className="ree-field" key={sideLabel}>
        <div className="ree-field-label">
          <span>{sideLabel}</span>
          <span className="ree-field-value">{amount}px</span>
        </div>
        <RangeControl label={sideLabel} value={amount} min={0} max={SPACING_MAX} step={1} onChange={(next) => commit(`${next}px`)} />
      </div>
    );
  };
  return (
    <div className="ree-spacing-control">
      <label className="ree-spacing-link">
        <input
          type="checkbox"
          checked={!independent && equal}
          onChange={(event) => {
            setIndependent(!event.target.checked);
            if (event.target.checked) onChange(`${sideAmount(sides[0])}px`);
          }}
        />
        Link sides
      </label>
      {!independent && equal
        ? slider(`${label} all sides`, sides[0], onChange)
        : (
          <div className="ree-spacing-grid">
            {SPACING_SIDES.map((side, index) => slider(side, sides[index], (next) => {
              const updated = [...sides];
              updated[index] = next;
              onChange(updated.join(" "));
            }))}
          </div>
        )}
    </div>
  );
}
