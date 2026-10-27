import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "solid";
}

export function Button({ type = "button", variant = "default", className = "", ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ree-btn${variant === "default" ? "" : ` ree-btn-${variant}`}${className ? ` ${className}` : ""}`} />;
}
