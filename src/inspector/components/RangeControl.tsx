interface RangeControlProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function RangeControl({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: RangeControlProps) {
  return (
    <div className="ree-range-row">
      <input
        type="range"
        className="ree-range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
