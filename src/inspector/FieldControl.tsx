import { useRef, type ChangeEvent } from "react";
import { ColorControl } from "./components/ColorControl";
import { SelectControl } from "./components/SelectControl";
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

  const insertVariable = (name: string) => {
    const element = ref.current;
    const token = `{{${name}}}`;
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
          value={stringValue}
          options={field.options ?? []}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="ree-field">
        <label className="ree-field-label">{field.label}</label>
        <ColorControl value={stringValue} onChange={(next) => onChange(next)} />
      </div>
    );
  }

  return (
    <div className="ree-field">
      {label}
      <input
        ref={(element) => {
          ref.current = element;
        }}
        className="ree-input"
        value={stringValue}
        placeholder={field.placeholder}
        type={field.type === "number" ? "number" : "text"}
        onChange={handleChange}
      />
    </div>
  );
}
