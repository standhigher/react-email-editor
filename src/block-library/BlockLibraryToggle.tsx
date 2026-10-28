import { Button } from "../components/Button";

interface BlockLibraryToggleProps {
  collapsed: boolean;
  libraryId: string;
  onToggle: () => void;
}

export function BlockLibraryToggle({ collapsed, libraryId, onToggle }: BlockLibraryToggleProps) {
  const label = collapsed ? "Expand blocks sidebar" : "Collapse blocks sidebar";

  return (
    <Button
      variant="icon"
      className={collapsed ? "ree-library-expand" : "ree-library-collapse"}
      aria-label={label}
      aria-expanded={!collapsed}
      aria-controls={libraryId}
      tooltip={label}
      onClick={(event) => {
        const nextButton = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
          collapsed ? ".ree-library-collapse" : ".ree-library-expand",
        );
        onToggle();
        requestAnimationFrame(() => nextButton?.focus());
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        {collapsed ? <path d="m14 9 3 3-3 3" /> : <path d="m16 9-3 3 3 3" />}
      </svg>
    </Button>
  );
}
