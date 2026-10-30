import { useEditorTranslation } from "../../i18n/context";
import { TEXT_ALIGN_OPTIONS } from "../constants";

interface AlignControlProps {
  value: string;
  onChange: (value: string) => void;
}

export function AlignControl({ value, onChange }: AlignControlProps) {
  const t = useEditorTranslation();
  return (
    <div className="ree-align-row">
      {TEXT_ALIGN_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`ree-align-btn${value === option.value ? " is-active" : ""}`}
          onClick={() => onChange(option.value)}
          title={t(option.labelKey)}
          aria-label={t(option.labelKey)}
          aria-pressed={value === option.value}
        >
          {option.glyph}
        </button>
      ))}
    </div>
  );
}
