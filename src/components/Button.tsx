import { useId, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "solid" | "icon";
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
