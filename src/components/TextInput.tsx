import { forwardRef, type InputHTMLAttributes } from "react";

/** Text input props; other attributes follow React input; supports ref. */
interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Input type, default text; excludes checkbox and other non-text kinds. */
  type?: "text" | "url" | "email" | "search" | "tel" | "password" | "number";
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className = "", type = "text", ...props },
  ref,
) {
  return <input {...props} ref={ref} type={type} className={`ree-input${className ? ` ${className}` : ""}`} />;
});
