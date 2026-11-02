import { useRef, type ReactNode } from "react";
import { ToolbarIcon } from "./ToolbarIcon";
import { useToolbarMenuPosition } from "../useToolbarMenuPosition";

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
  const menuRef = useToolbarMenuPosition(rootRef, open, align);

  const buttonClass =
    variant === "icon"
      ? `ree-tool-btn${active ? " is-active" : ""}${open ? " is-open" : ""}`
      : `ree-rte-select${open ? " is-open" : ""}`;

  return (
    <div className="ree-rte-pop" ref={rootRef}>
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
          ref={menuRef}
          className={[
            "ree-rte-menu",
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
