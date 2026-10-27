import { useEffect, useRef, useState } from "react";
import type { Variable } from "../types/block";

interface PersonalizationMenuProps {
  variables: Variable[];
  onInsert: (name: string) => void;
}

export function PersonalizationMenu({
  variables,
  onInsert,
}: PersonalizationMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!open || !root) return;
    const ownerDocument = root.ownerDocument;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) setOpen(false);
    };
    ownerDocument.addEventListener("pointerdown", onPointerDown, true);
    return () => ownerDocument.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  return (
    <div className="ree-personalization" ref={rootRef}>
      <button
        type="button"
        className="ree-personalization-btn"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Personalization
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M5.2 7.5 10 12.3l4.8-4.8 1.2 1.2L10 14.7 4 8.7l1.2-1.2Z" />
        </svg>
      </button>
      {open ? (
        <div className="ree-var-menu ree-personalization-menu">
          {variables.length === 0 ? (
            <div className="ree-personalization-empty">No personalization fields</div>
          ) : (
            variables.map((variable) => (
              <button
                key={variable.name}
                type="button"
                className="ree-var-item"
                onClick={() => {
                  onInsert(variable.name);
                  setOpen(false);
                }}
              >
                <span className="ree-var-name">{variable.name}</span>
                {variable.description ? <span className="ree-var-label">{variable.description}</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
