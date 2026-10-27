import type { CSSProperties } from "react";

interface MetricSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  overridden: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
}

export function MetricSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  overridden,
  onChange,
  onReset,
}: MetricSliderProps) {
  const progress = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return (
    <div className="ree-rte-metric">
      <div className="ree-rte-metric-label">
        <span>{label}</span>
        <span>{display}</span>
      </div>
      <input
        aria-label={label}
        type="range"
        className="ree-range"
        style={{ "--ree-range-progress": `${progress}%` } as CSSProperties}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <button type="button" className="ree-rte-option" disabled={!overridden} onClick={onReset}>
        Default
      </button>
    </div>
  );
}
