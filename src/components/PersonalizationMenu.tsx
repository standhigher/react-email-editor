import { useEditorTranslation } from "../i18n/context";
import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Variable } from "../types/block";
import { usePersonalizationMenu } from "./usePersonalizationMenu";

interface PersonalizationMenuProps {
  variables: Variable[];
  onInsert: (name: string) => void;
  suffix?: boolean;
}

export function PersonalizationMenu({
  variables,
  onInsert,
  suffix = false,
}: PersonalizationMenuProps) {
  const t = useEditorTranslation();
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);
  const position = usePersonalizationMenu(open && variables.length > 0, rootRef, menuRef, focusOnOpen, setOpen);

  if (variables.length === 0) return null;

  return (
    <div className={suffix ? "ree-personalization ree-personalization-suffix" : "ree-personalization"} ref={rootRef}>
      <button
        type="button"
        className={suffix ? "ree-personalization-suffix-btn" : "ree-personalization-btn"}
        aria-label={suffix ? t("editor.insertVariable") : undefined}
        title={suffix ? t("editor.personalization") : undefined}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(event) => {
          focusOnOpen.current = event.detail === 0;
          const root = rootRef.current;
          if (root) setHost(root.closest<HTMLElement>(".ree-root") ?? root.ownerDocument.body);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab" && open && !event.shiftKey) {
            event.preventDefault();
            menuRef.current?.querySelector("button")?.focus();
          }
        }}
      >
        {suffix ? "{ }" : t("editor.personalization")}
        {suffix ? null : <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M5.2 7.5 10 12.3l4.8-4.8 1.2 1.2L10 14.7 4 8.7l1.2-1.2Z" />
        </svg>}
      </button>
      {open && host ? createPortal(
        <div id={id} ref={menuRef} className="ree-var-menu ree-personalization-menu" style={position}>
          {variables.map((variable) => (
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
          ))}
        </div>, host,
      ) : null}
    </div>
  );
}
