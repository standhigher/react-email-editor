/** Checkbox or switch props. */
interface CheckboxControlProps {
  /** Visible and accessible label. */
  label: string;
  /** Current checked state. */
  checked: boolean;
  /** Whether disabled. */
  disabled?: boolean;
  /** Additional root CSS class. */
  className?: string;
  /** Appearance: checkbox by default, or switch. */
  variant?: "checkbox" | "switch";
  /** Receive the new checked state. */
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
