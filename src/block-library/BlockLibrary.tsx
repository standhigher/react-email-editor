import type { BlockDefinition } from "../types/block";
import { BlockLibraryItem } from "./BlockLibraryItem";

interface BlockLibraryProps {
  definitions: BlockDefinition[];
  onAdd: (type: string) => void;
}

export function BlockLibrary({ definitions, onAdd }: BlockLibraryProps) {
  return (
    <aside className="ree-col ree-col-left">
      <div className="ree-col-head">Blocks</div>
      <div className="ree-lib">
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
