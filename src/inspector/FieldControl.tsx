import { useRef, type ChangeEvent } from "react";
import { ColorControl } from "../components/ColorControl";
import { RangeControl } from "../components/RangeControl";
import { SelectControl } from "../components/SelectControl";
import { TextInput } from "../components/TextInput";
import { HtmlCodeEditor } from "./HtmlCodeEditor";
import { VariablesDropdown } from "./VariablesDropdown";
import type { FieldConfig, Variable } from "../types/block";

interface FieldControlProps {
  field: FieldConfig;
  value: unknown;
  variables: Variable[];
  onChange: (value: unknown) => void;
}

export function FieldControl({
  field,
  value,
  variables,
  onChange,
}: FieldControlProps) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const stringValue = value == null ? "" : String(value);

  const insertVariable = (token: string) => {
    const element = ref.current;
    if (element && "selectionStart" in element) {
      const start = element.selectionStart ?? stringValue.length;
      const end = element.selectionEnd ?? stringValue.length;
      onChange(stringValue.slice(0, start) + token + stringValue.slice(end));
      return;
    }
    onChange(stringValue + token);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => onChange(event.target.value);

  const label = (
    <div className="ree-field-label">
      <span>{field.label}</span>
      {field.type === "text" || field.type === "textarea" || field.type === "url" ? (
        <VariablesDropdown variables={variables} onInsert={insertVariable} />
      ) : null}
    </div>
  );

  if (field.type === "html") {
    return (
      <div className="ree-field">
        <div className="ree-field-label">
          <span>{field.label}</span>
        </div>
        <HtmlCodeEditor
          value={stringValue}
          placeholder={field.placeholder}
          rows={field.rows}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="ree-field">
        {label}
        <textarea
          ref={(element) => {
            ref.current = element;
          }}
          className="ree-input ree-textarea"
          value={stringValue}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          onChange={handleChange}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="ree-field">
        <label className="ree-field-label">{field.label}</label>
        <SelectControl
          label={field.label}
          value={stringValue}
          options={field.options ?? []}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="ree-color-chip-row">
        <ColorControl label={field.label} value={stringValue} resetTo={String(field.defaultValue ?? "")} onChange={(next) => onChange(next)} />
      </div>
    );
  }

  if (field.type === "number") {
    const amount = Number(value);
    const max = field.max ?? 200;
    const shown = Math.min(max, Math.max(field.min ?? 0, Number.isFinite(amount) ? amount : field.min ?? 0));
    return (
      <div className="ree-field">
        <div className="ree-field-label">
          <span>{field.label}</span>
          <span className="ree-field-value">{shown}px</span>
        </div>
        <RangeControl label={field.label} value={shown} min={field.min} max={max} step={field.step} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="ree-field">
      {label}
      <TextInput
        ref={(element) => {
          ref.current = element;
        }}
        aria-label={field.label}
        min={field.min}
        max={field.max}
        step={field.step}
        value={stringValue}
        placeholder={field.placeholder}
        type="text"
        onChange={handleChange}
      />
    </div>
  );
}
