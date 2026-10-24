import { useState } from "react";
import type { Variable } from "../types/block";

interface VariablesDropdownProps {
  variables: Variable[];
  onInsert: (name: string) => void;
}

export function VariablesDropdown({ variables, onInsert }: VariablesDropdownProps) {
  const [open, setOpen] = useState(false);
  if (variables.length === 0) return null;

  return (
    <div className="ree-var-wrap">
      <button
        type="button"
        className="ree-var-btn"
        onClick={() => setOpen((current) => !current)}
        title="Insert variable"
      >
        {"{ }"}
      </button>
      {open ? (
        <div className="ree-var-menu">
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
              <span className="ree-var-name">{`{{${variable.name}}}`}</span>
              <span className="ree-var-label">{variable.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
