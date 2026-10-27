import { forwardRef, type InputHTMLAttributes } from "react";

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "text" | "url" | "email" | "search" | "tel" | "password" | "number";
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className = "", type = "text", ...props },
  ref,
) {
  return <input {...props} ref={ref} type={type} className={`ree-input${className ? ` ${className}` : ""}`} />;
});
