import { TEXT_ALIGN_OPTIONS } from "../constants";

interface AlignControlProps {
  value: string;
  onChange: (value: string) => void;
}

export function AlignControl({ value, onChange }: AlignControlProps) {
  return (
    <div className="ree-align-row">
      {TEXT_ALIGN_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`ree-align-btn${value === option.value ? " is-active" : ""}`}
          onClick={() => onChange(option.value)}
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
        >
          {option.glyph}
        </button>
      ))}
    </div>
  );
}
