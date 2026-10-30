import { useEditorTranslation } from "../../../i18n/context";
import { RangeControl } from "../../../components/RangeControl";
import { ResetButton } from "../../../components/ResetButton";

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
  const t = useEditorTranslation();
  return (
    <div className="ree-rte-metric">
      <div className="ree-rte-metric-label">
        <span>{label}</span>
        <span className="ree-rte-metric-meta">
          <span>{display}</span>
          <ResetButton label={t("common.resetLabel", { label: label.toLowerCase() })} disabled={!overridden} onClick={onReset} />
        </span>
      </div>
      <RangeControl
        label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  );
}
