interface CheckboxControlProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  className?: string;
  onChange: (checked: boolean) => void;
}

export function CheckboxControl({ label, checked, disabled, className = "", onChange }: CheckboxControlProps) {
  return (
    <label className={`ree-checkbox-control${className ? ` ${className}` : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
