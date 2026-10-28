import { useId, type ButtonHTMLAttributes } from "react";

/** Button props; other attributes follow React button; type defaults to button. */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Appearance: default, primary, solid or icon; default is default. */
  variant?: "default" | "primary" | "solid" | "icon";
  /** Optional tooltip linked through aria-describedby. */
  tooltip?: string;
}

export function Button({ type = "button", variant = "default", className = "", tooltip, children, "aria-describedby": describedBy, ...props }: ButtonProps) {
  const tooltipId = useId();

  return (
    <button
      {...props}
      type={type}
      aria-describedby={tooltip ? [describedBy, tooltipId].filter(Boolean).join(" ") : describedBy}
      className={`ree-btn${variant === "default" ? "" : ` ree-btn-${variant}`}${tooltip ? " ree-btn-has-tooltip" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
      {tooltip && <span id={tooltipId} className="ree-btn-tooltip" role="tooltip">{tooltip}</span>}
    </button>
  );
}
