import { AlignControl } from "./components/AlignControl";
import { ColorControl } from "./components/ColorControl";
import { RangeControl } from "./components/RangeControl";
import { SelectControl } from "./components/SelectControl";
import type { StyleFieldConfig } from "../types/block";

interface StyleControlProps {
  config: StyleFieldConfig;
  value: string;
  inheritedColor?: string;
  onChange: (value: string) => void;
}

export function StyleControl({
  config,
  value,
  inheritedColor,
  onChange,
}: StyleControlProps) {
  const numeric = parseFloat(value);
  const hasNumeric = Number.isFinite(numeric);
  const numberValue = hasNumeric ? numeric : (config.min ?? 0);
  const format = (next: number) => (config.unit ? `${next}${config.unit}` : String(next));
  const readout = config.control === "range" ? `${numberValue}${config.unit ?? ""}` : null;

  return (
    <div className="ree-field">
      <div className="ree-field-label">
        <span>{config.label}</span>
        {readout ? <span className="ree-field-value">{readout}</span> : null}
      </div>

      {config.control === "color" ? (
        <ColorControl
          value={value}
          fallback={config.id === "typography.color" ? inheritedColor : undefined}
          allowEmpty={config.id === "typography.color"}
          onChange={onChange}
        />
      ) : null}

      {config.control === "alignment" ? (
        <AlignControl value={value} onChange={onChange} />
      ) : null}

      {config.control === "select" ? (
        <SelectControl
          value={value}
          options={config.options ?? []}
          onChange={onChange}
        />
      ) : null}

      {config.control === "number" ? (
        <div className="ree-input-group">
          <input
            type="number"
            className="ree-input ree-input-number"
            value={numberValue}
            min={config.min}
            max={config.max}
            step={config.step ?? 1}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChange(format(next));
            }}
          />
          {config.unit ? <span className="ree-input-unit">{config.unit}</span> : null}
        </div>
      ) : null}

      {config.control === "range" ? (
        <RangeControl
          value={numberValue}
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(next) => onChange(format(next))}
        />
      ) : null}

      {config.control === "text" ? (
        <input
          className="ree-input"
          value={value}
          placeholder="e.g. 16px"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
