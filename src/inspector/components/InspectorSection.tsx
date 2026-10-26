import { useState, type ReactNode } from "react";

interface InspectorSectionProps {
  title: string;
  children: ReactNode;
}

export function InspectorSection({ title, children }: InspectorSectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <section className="ree-inspector-section">
      <button
        type="button"
        className="ree-inspector-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M4 6.25 8 10.25 12 6.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? <div className="ree-inspector-section-body">{children}</div> : null}
    </section>
  );
}
