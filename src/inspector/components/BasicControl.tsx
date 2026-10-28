import { useRef, useId } from "react";
import { ColorControl } from "../../components/ColorControl";
import { CheckboxControl } from "../../components/CheckboxControl";
import { SelectControl } from "../../components/SelectControl";
import { TextInput } from "../../components/TextInput";
import { HtmlCodeEditor } from "../HtmlCodeEditor";
import { VariablesDropdown } from "../VariablesDropdown";
import { safeEmailUrl } from "../../plugins/email-tools";
import type { ControlRendererProps } from "../ControlRenderer";

export function BasicControl({ control, value, variables, onChange }: ControlRendererProps) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const id = useId();
  const shown = value == null || (typeof value === "number" && !Number.isFinite(value)) ? "" : String(value);
  const insertVariable = (token: string) => {
    const element = ref.current;
    const start = element?.selectionStart ?? shown.length;
    const end = element?.selectionEnd ?? shown.length;
    onChange(shown.slice(0, start) + token + shown.slice(end));
  };
  if (control.kind === "boolean") return <CheckboxControl label={control.label} checked={Boolean(value)} onChange={onChange} />;
  if (control.kind === "color") return <ColorControl label={control.label} value={shown} resetTo={String(control.defaultValue ?? "")} onChange={onChange} />;
  if (control.kind === "html") return <div className="ree-field"><span className="ree-field-label">{control.label}</span><HtmlCodeEditor value={shown} placeholder={control.placeholder} rows={control.rows} onChange={onChange} /></div>;
  const textual = control.kind === "text" || control.kind === "textarea" || control.kind === "url";
  const invalidUrl = control.kind === "url" && shown.trim() && !safeEmailUrl(shown);
  return (
    <div className="ree-field">
      <div className="ree-field-label"><label htmlFor={id}>{control.label}{control.unit ? ` (${control.unit})` : ""}</label>{textual ? <VariablesDropdown variables={variables} onInsert={insertVariable} /> : null}</div>
      {control.kind === "select" ? <SelectControl id={id} label={control.label} value={shown} options={control.options ?? []} emptyLabel={control.placeholder ?? "None"} onChange={onChange} />
        : control.kind === "textarea" ? <textarea id={id} ref={(element) => { ref.current = element; }} className="ree-input ree-textarea" value={shown} placeholder={control.placeholder} rows={control.rows ?? 4} onChange={(event) => onChange(event.target.value)} />
          : <TextInput id={id} ref={(element) => { ref.current = element; }} type={control.kind === "number" ? "number" : "text"} value={shown} min={control.min} max={control.max} step={control.step} placeholder={control.placeholder} aria-invalid={Boolean(invalidUrl) || Boolean(control.validateValue?.(value))} onChange={(event) => onChange(control.kind === "number" && event.target.value !== "" ? Number(event.target.value) : event.target.value)} />}
    </div>
  );
}
