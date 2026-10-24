import { TEXT_ALIGN_OPTIONS } from "./constants";
import { colorInputValue } from "./utils";
import type { StyleFieldConfig } from "../types/block";

interface StyleControlProps {
  config: StyleFieldConfig;
  value: string;
  onChange: (value: string) => void;
}

export function StyleControl({ config, value, onChange }: StyleControlProps) {
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
        <div className="ree-color-row">
          <input
            type="color"
            value={colorInputValue(value)}
            onChange={(event) => onChange(event.target.value)}
            className="ree-color-input"
          />
          <span className="ree-color-value">{value || "–"}</span>
        </div>
      ) : null}

      {config.control === "alignment" ? (
        <div className="ree-align-row">
          {TEXT_ALIGN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ree-align-btn${value === option.value ? " is-active" : ""}`}
              onClick={() => onChange(option.value)}
              title={option.label}
            >
              {option.glyph}
            </button>
          ))}
        </div>
      ) : null}

      {config.control === "select" ? (
        <select
          className="ree-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {(config.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
        <div className="ree-range-row">
          <input
            type="range"
            className="ree-range"
            value={numberValue}
            min={config.min ?? 0}
            max={config.max ?? 100}
            step={config.step ?? 1}
            onChange={(event) => onChange(format(Number(event.target.value)))}
          />
        </div>
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
