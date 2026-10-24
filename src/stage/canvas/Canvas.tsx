import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CANVAS_DEVICE_WIDTH, CANVAS_DROP_ID } from "../../constants/editor";
import { getBlockDefinition } from "../../document/registry";
import { CanvasBlock } from "./CanvasBlock";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailBlockNode } from "../../types/document";
import type { EditorDevice } from "../../types/editor";

interface CanvasProps {
  blocks: EmailBlockNode[];
  definitions: BlockDefinition[];
  selectedId: string | null;
  overId: string | null;
  variables: Variable[];
  device: EditorDevice;
  onSelect: (id: string | null) => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Canvas({
  blocks,
  definitions,
  selectedId,
  overId,
  variables,
  device,
  onSelect,
  onCommitField,
  onMove,
  onDuplicate,
  onRemove,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROP_ID,
    data: { kind: "canvas" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`ree-canvas${isOver ? " is-over" : ""}`}
      onClick={() => onSelect(null)}
    >
      <div
        className="ree-canvas-inner"
        style={{ maxWidth: CANVAS_DEVICE_WIDTH[device] }}
      >
        {blocks.length === 0 ? (
          <div className="ree-canvas-empty">
            Drag a block here or click one to get started
          </div>
        ) : (
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <CanvasBlock
                key={block.id}
                block={block}
                definition={getBlockDefinition(block.type, definitions)}
                selected={block.id === selectedId}
                isOver={overId === block.id}
                variables={variables}
                onSelect={() => onSelect(block.id)}
                onCommitField={onCommitField}
                onMove={(direction) => onMove(block.id, direction)}
                onDuplicate={() => onDuplicate(block.id)}
                onRemove={() => onRemove(block.id)}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
