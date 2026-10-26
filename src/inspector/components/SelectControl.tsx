import type { FieldOption } from "../../types/block";

interface SelectControlProps {
  value: string;
  options: FieldOption[];
  onChange: (value: string) => void;
}

export function SelectControl({ value, options, onChange }: SelectControlProps) {
  return (
    <div className="ree-select">
      <select
        className="ree-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
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
    </div>
  );
}
