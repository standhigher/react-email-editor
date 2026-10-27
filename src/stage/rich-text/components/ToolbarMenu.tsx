import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ToolbarIcon } from "./ToolbarIcon";

interface ToolbarMenuProps {
  label: ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  align?: "start" | "end";
  caret?: boolean;
  active?: boolean;
  variant?: "select" | "icon";
  panelClassName?: string;
  children: ReactNode;
}

export function ToolbarMenu({
  label,
  title,
  open,
  onToggle,
  align = "start",
  caret = true,
  active = false,
  variant = "select",
  panelClassName,
  children,
}: ToolbarMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [up, setUp] = useState(false);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const ownerWindow = rootRef.current.ownerDocument.defaultView;
    if (!ownerWindow) return;
    const rect = rootRef.current.getBoundingClientRect();
    setUp(rect.bottom + 260 > ownerWindow.innerHeight && rect.top > 260);
  }, [open]);

  const buttonClass =
    variant === "icon"
      ? `ree-tool-btn${active ? " is-active" : ""}${open ? " is-open" : ""}`
      : `ree-rte-select${open ? " is-open" : ""}`;

  return (
    <div className={`ree-rte-pop${up ? " is-up" : ""}`} ref={rootRef}>
      <button
        type="button"
        className={buttonClass}
        title={title}
        aria-label={variant === "icon" ? title : undefined}
        aria-expanded={open}
        onClick={onToggle}
      >
        {variant === "select" ? <span className="ree-rte-select-label">{label}</span> : label}
        {caret ? <ToolbarIcon name="chevron" /> : null}
      </button>
      {open ? (
        <div
          className={[
            "ree-rte-menu",
            align === "end" ? "is-end" : "",
            panelClassName ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
