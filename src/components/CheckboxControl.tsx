interface CheckboxControlProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  className?: string;
  variant?: "checkbox" | "switch";
  onChange: (checked: boolean) => void;
}

export function CheckboxControl({ label, checked, disabled, className = "", variant = "checkbox", onChange }: CheckboxControlProps) {
  return (
    <label className={`ree-checkbox-control${variant === "switch" ? " ree-switch-control" : ""}${className ? ` ${className}` : ""}`}>
      <input type="checkbox" role={variant === "switch" ? "switch" : undefined} checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
