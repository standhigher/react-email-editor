import type { ReactNode } from "react";

interface ToolbarButtonProps {
  title: string;
  active?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  controls?: string;
  onClick: () => void;
  children: ReactNode;
}

export function ToolbarButton({
  title,
  active = false,
  disabled = false,
  expanded,
  controls,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`ree-tool-btn${active ? " is-active" : ""}`}
      title={title}
      aria-pressed={expanded === undefined ? active : undefined}
      aria-haspopup={expanded === undefined ? undefined : "dialog"}
      aria-expanded={expanded}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
