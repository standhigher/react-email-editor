import { useEffect, useRef } from "react";

interface LinkPopoverProps {
  url: string;
  canUnlink: boolean;
  onUrlChange: (url: string) => void;
  onApply: () => void;
  onUnlink: () => void;
}

export function LinkPopover({
  url,
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
