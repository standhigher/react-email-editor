import { useId, useState } from "react";
import type { BlockDefinition } from "../types/block";
import { BlockLibraryItem } from "./BlockLibraryItem";
import { BlockLibraryToggle } from "./BlockLibraryToggle";

interface BlockLibraryProps {
  definitions: readonly BlockDefinition[];
  onAdd: (type: string) => void;
}

export function BlockLibrary({ definitions, onAdd }: BlockLibraryProps) {
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const libraryId = useId();

  return (
    <aside className={`ree-col ree-col-left${collapsed === null ? "" : collapsed ? " is-collapsed" : " is-expanded"}`}>
      <div className="ree-col-head ree-library-head">
        <span className="ree-library-label">Blocks</span>
        <BlockLibraryToggle collapsed={false} libraryId={libraryId} onToggle={() => setCollapsed(true)} />
        <BlockLibraryToggle collapsed libraryId={libraryId} onToggle={() => setCollapsed(false)} />
      </div>
      <div id={libraryId} className="ree-lib">
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
