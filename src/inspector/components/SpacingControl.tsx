import { useEditorTranslation } from "../../i18n/context";
import { useState } from "react";
import { readCssLength, spacingSides } from "../../utils/css-values";
import { SPACING_MAX, SPACING_SIDES } from "../constants";
import { RangeControl } from "../../components/RangeControl";
import { CheckboxControl } from "../../components/CheckboxControl";

interface SpacingControlProps {
  label: string;
  value: string;
  max?: number;
  sides?: readonly string[];
  linkLabel?: string;
  uniformLabel?: string;
  expand?: (value: string) => string[];
  onChange: (value: string) => void;
}

function sideAmount(value: string, max: number): number {
  return Math.min(max, Math.max(0, readCssLength(value, ["px"]).amount));
}

export function SpacingControl({
  label,
  value,
  max = SPACING_MAX,
  sides: customSides,
  linkLabel,
  uniformLabel,
  expand = spacingSides,
  onChange,
}: SpacingControlProps) {
  const t = useEditorTranslation();
  const sideLabels = customSides ?? SPACING_SIDES.map((key) => t(key));
  const sides = expand(value);
  const equal = sides.every((side) => sideAmount(side, max) === sideAmount(sides[0], max));
  const [independent, setIndependent] = useState(!equal);
  const slider = (sideLabel: string, sideValue: string, commit: (next: string) => void) => {
    const amount = sideAmount(sideValue, max);
    return (
      <div className="ree-field" key={sideLabels.indexOf(sideLabel)}>
        <div className="ree-field-label">
          <span>{sideLabel}</span>
          <span className="ree-field-value">{amount}px</span>
        </div>
        <RangeControl label={sideLabel} value={amount} min={0} max={max} step={1} onChange={(next) => commit(`${next}px`)} />
      </div>
    );
  };
  return (
    <div className="ree-spacing-control">
      <CheckboxControl
        className="ree-spacing-link"
        label={linkLabel ?? t("inspector.linkSides")}
        checked={!independent && equal}
        onChange={(checked) => {
          setIndependent(!checked);
          if (checked) onChange(`${sideAmount(sides[0] ?? "0px", max)}px`);
        }}
      />
      {!independent && equal
        ? slider(uniformLabel ?? t("inspector.allSides", { label }), sides[0] ?? "0px", onChange)
        : (
          <div className="ree-spacing-grid">
            {sideLabels.map((side, index) => slider(side, sides[index] ?? "0px", (next) => {
              const updated = [...sides];
              updated[index] = next;
              onChange(updated.join(" "));
            }))}
          </div>
        )}
    </div>
  );
}
