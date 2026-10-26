import { useEffect, useState } from "react";

interface CssValueInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

/** 在失焦或回车时提交，允许完整输入 12px、100%、auto 等值。 */
export function CssValueInput({ label, value, placeholder, onChange }: CssValueInputProps) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return <input className="ree-input" aria-label={label} value={draft} placeholder={placeholder ?? "0px"}
    onChange={(event) => setDraft(event.target.value)}
    onBlur={() => { onChange(draft.trim()); setDraft(value); }}
    onKeyDown={(event) => {
      if (event.key === "Enter") event.currentTarget.blur();
      if (event.key === "Escape") { setDraft(value); event.stopPropagation(); }
    }} />;
}
