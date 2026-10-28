import type { ControlOption } from "../types/block";

interface SelectControlProps {
  id?: string;
  label?: string;
  value: string;
  options: readonly ControlOption[];
  emptyLabel?: string;
  compact?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function SelectControl({ id, label, value, options, emptyLabel, compact = false, disabled, onChange }: SelectControlProps) {
  return (
    <span className={`ree-select${compact ? " is-compact" : ""}`}>
      <select
        id={id}
        aria-label={label}
        disabled={disabled}
        className="ree-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {emptyLabel !== undefined && !options.some((option) => option.value === "") ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="ree-select-icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
          <path
            d="M4 6.25 8 10.25 12 6.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
