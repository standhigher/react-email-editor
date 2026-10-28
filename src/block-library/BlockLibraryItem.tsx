import { useDraggable } from "@dnd-kit/core";
import { BlockIcon } from "../components/BlockIcon";
import type { BlockDefinition } from "../types/block";
import type { LibraryDragData } from "../types/editor";

interface BlockLibraryItemProps {
  definition: BlockDefinition;
  onAdd: () => void;
}

export function BlockLibraryItem({ definition, onAdd }: BlockLibraryItemProps) {
  const dragData: LibraryDragData = { kind: "library", type: definition.type };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${definition.type}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`ree-lib-item${isDragging ? " is-dragging" : ""}`}
      onClick={onAdd}
      aria-label={definition.title}
      title={definition.description ? `${definition.title}: ${definition.description}` : definition.title}
    >
      <BlockIcon icon={definition.icon} className="ree-lib-icon" />
      <span className="ree-lib-title">{definition.title}</span>
    </div>
  );
}
