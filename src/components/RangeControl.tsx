import type { CSSProperties } from "react";

/** Numeric range props. */
interface RangeControlProps {
  /** Native input DOM ID. */
  id?: string;
  /** Accessible name. */
  label?: string;
  /** Current numeric value. */
  value: number;
  /** Minimum, default 0. */
  min?: number;
  /** Maximum, default 100. */
  max?: number;
  /** Increment, default 1. */
  step?: number;
  /** Receive the updated number. */
  onChange: (value: number) => void;
}

export function RangeControl({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: RangeControlProps) {
  const progress = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return (
    <input
      id={id}
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
  );
}
