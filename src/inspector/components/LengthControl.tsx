import { formatCssLength } from "../../utils/css-values";
import { RangeControl } from "./RangeControl";

interface LengthControlProps {
  id?: string;
  label: string;
  amount: number;
  unit: string;
  units: string[];
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
}

interface LengthBounds {
  min: number;
  max: number;
  step: number;
}

function bounds(unit: string, min: number, max: number, step: number): LengthBounds {
  if (unit === "%") return { min: 0, max: 100, step: 1 };
  return { min, max, step };
}

function snap(value: number, step: number): number {
  const places = (String(step).split(".")[1] ?? "").length;
  return Number((Math.round(value / step) * step).toFixed(places));
}

export function LengthControl({
  id,
  label,
  amount,
  unit,
  units,
  min = 0,
  max = 200,
  step = 1,
  onChange,
}: LengthControlProps) {
  const range = bounds(unit, min, max, step);
  const shown = Math.min(range.max, Math.max(range.min, amount));
  const commit = (nextAmount: number, nextUnit: string) => {
    if (nextUnit === "auto") {
      onChange("auto");
      return;
    }
    const nextRange = bounds(nextUnit, min, max, step);
    const snapped = snap(Math.min(nextRange.max, Math.max(nextRange.min, nextAmount)), nextRange.step);
    onChange(formatCssLength(snapped, nextUnit));
  };
  return (
    <div className="ree-range-row">
      {unit === "auto" ? null : (
        <RangeControl id={id} label={label} value={shown} min={range.min} max={range.max} step={range.step} onChange={(next) => commit(next, unit)} />
      )}
      {units.length > 1 ? (
        <select
          className="ree-unit-select"
          aria-label={`${label} unit`}
          value={unit}
          onChange={(event) => {
            const nextUnit = event.target.value;
            if (nextUnit === unit) return;
            const seed = unit === "auto" ? (nextUnit === "%" ? 100 : Math.min(max, 160)) : amount;
            commit(seed, nextUnit);
          }}
        >
          {units.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
