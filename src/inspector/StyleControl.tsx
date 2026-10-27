import { useId } from "react";
import { cornerRadii, cssLength, formatCssLength, readCssLength } from "../utils/css-values";
import { CORNER_SIDES } from "./constants";
import { AlignControl } from "./components/AlignControl";
import { ColorControl } from "./components/ColorControl";
import { CssValueInput } from "./components/CssValueInput";
import { LengthControl } from "./components/LengthControl";
import { ResetButton } from "./components/ResetButton";
import { SelectControl } from "./components/SelectControl";
import { SpacingControl } from "./components/SpacingControl";
import type { StyleFieldConfig } from "../types/block";

interface StyleControlProps {
  config: StyleFieldConfig;
  value: string;
  fallback?: string;
  resetLabel?: string;
  /** 点击重置时写回的值。空字符串表示清除覆盖。 */
  resetTo?: string;
  /** 未传时，只要当前有存储值就显示重置。 */
  showReset?: boolean;
  onChange: (value: string) => void;
}

function lengthUnits(config: StyleFieldConfig): string[] {
  if (config.units?.length) return config.units;
  if (config.unit) return [config.unit];
  return [];
}

export function StyleControl({ config, value, fallback, resetLabel = "Reset", resetTo, showReset, onChange }: StyleControlProps) {
  const id = useId();
  const units = lengthUnits(config);
  const stored = value === "auto" && units.length > 0 && !units.includes("auto") ? "" : value;
  const actual = stored || fallback || config.defaultValue || "";
  const numeric = config.control === "range" || config.control === "number";
  const parsed = numeric ? readCssLength(actual, units) : null;
  const options = config.options ?? [];
  const selectOptions = actual && !options.some((option) => option.value === actual)
    ? [{ label: actual, value: actual }, ...options] : options;
  const reset = (showReset ?? Boolean(value)) ? <ResetButton label={resetLabel} onClick={() => onChange(resetTo ?? "")} /> : null;

  if (config.control === "color") {
    return (
      <div className="ree-color-chip-row">
        <ColorControl label={config.label} value={actual} onChange={onChange} />
        {reset}
      </div>
    );
  }

  return (
    <div className="ree-field">
      <div className="ree-field-label">
        <label htmlFor={numeric ? id : undefined}>{config.label}</label>
        <span className="ree-field-meta">
          {parsed ? <span className="ree-field-value">{formatCssLength(parsed.amount, parsed.unit)}</span> : null}
          {reset}
        </span>
      </div>
      {config.control === "alignment" ? <AlignControl value={actual} onChange={onChange} /> : null}
      {config.control === "select" ? <SelectControl label={config.label} value={actual} options={selectOptions} onChange={onChange} /> : null}
      {numeric && parsed ? (
        <LengthControl
          id={id}
          label={config.label}
          amount={parsed.amount}
          unit={parsed.unit}
          units={units}
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={onChange}
        />
      ) : null}
      {config.control === "text" ? (
        <CssValueInput
          label={config.label}
          value={actual}
          placeholder={config.placeholder}
          onChange={(next) => {
            if (!next || cssLength(next, "")) onChange(next);
          }}
        />
      ) : null}
      {config.control === "spacing" ? <SpacingControl label={config.label} value={actual} onChange={onChange} /> : null}
      {config.control === "corners" ? (
        <SpacingControl
          label={config.label}
          value={actual}
          max={config.max ?? 48}
          sides={CORNER_SIDES}
          linkLabel="Link corners"
          uniformLabel="All corners"
          expand={cornerRadii}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}
