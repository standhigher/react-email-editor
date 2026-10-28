import { useId, useState } from "react";
import { Button } from "../components/Button";
import type { BlockDefinition } from "../types/block";
import { BlockLibraryItem } from "./BlockLibraryItem";

interface BlockLibraryProps {
  definitions: BlockDefinition[];
  onAdd: (type: string) => void;
}

export function BlockLibrary({ definitions, onAdd }: BlockLibraryProps) {
  const [collapsed, setCollapsed] = useState(false);
  const libraryId = useId();

  return (
    <aside className={`ree-col ree-col-left${collapsed ? " is-collapsed" : ""}`}>
      <div className="ree-col-head ree-library-head">
        {!collapsed && <span>Blocks</span>}
        <Button
          variant="icon"
          aria-label={collapsed ? "Expand blocks sidebar" : "Collapse blocks sidebar"}
          aria-expanded={!collapsed}
          aria-controls={libraryId}
          tooltip={collapsed ? "Expand blocks sidebar" : "Collapse blocks sidebar"}
          onClick={() => setCollapsed((value) => !value)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            {collapsed ? <path d="m14 9 3 3-3 3" /> : <path d="m16 9-3 3 3 3" />}
          </svg>
        </Button>
      </div>
      <div id={libraryId} className="ree-lib" hidden={collapsed}>
        {definitions.map((definition) => (
          <BlockLibraryItem
            key={definition.type}
            definition={definition}
            onAdd={() => onAdd(definition.type)}
          />
        ))}
      </div>
    </aside>
  );
}
