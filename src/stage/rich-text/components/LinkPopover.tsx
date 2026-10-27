import { useEffect, useRef } from "react";
import { TEXT_COLORS } from "../constants";
import { ColorMenu } from "./ColorMenu";

interface LinkPopoverProps {
  url: string;
  color: string;
  fallbackColor: string;
  decoration: string;
  onColorChange: (value: string) => void;
  onDecorationChange: (value: string) => void;
  canUnlink: boolean;
  onUrlChange: (url: string) => void;
  onApply: () => void;
  onUnlink: () => void;
}

export function LinkPopover({
  url,
  color,
  fallbackColor,
  decoration,
  onColorChange,
  onDecorationChange,
  canUnlink,
  onUrlChange,
  onApply,
  onUnlink,
}: LinkPopoverProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="ree-rte-link">
      <label className="ree-field">
        <span className="ree-field-label">Link URL</span>
        <input
          ref={inputRef}
          className="ree-input"
          value={url}
          placeholder="https://"
          onChange={(event) => onUrlChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onApply();
            }
          }}
        />
      </label>
      <div className="ree-field">
        <span className="ree-field-label">Link color</span>
        <ColorMenu colors={TEXT_COLORS} value={color} fallback={fallbackColor} onSelect={onColorChange} onClear={() => onColorChange("")} />
      </div>
      <label className="ree-field">
        <span className="ree-field-label">Link decoration</span>
        <select className="ree-input" value={decoration} onChange={(event) => onDecorationChange(event.target.value)}>
          <option value="">Default</option>
          <option value="underline">Underline</option>
          <option value="none">None</option>
        </select>
      </label>
      <div className="ree-rte-link-actions">
        <button type="button" className="ree-btn" disabled={!canUnlink} onClick={onUnlink}>
          Unlink
        </button>
        <button type="button" className="ree-btn ree-btn-primary" onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  );
}
