import { useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { DRAG_ACTIVATION_DISTANCE } from "../constants/editor";
import { BlockIcon } from "../components/BlockIcon";
import { resolveInsertIndex } from "../document/mutations";
import { getBlockDefinition } from "../document/registry";
import { EditorDragContext } from "./drag-context";
import { readDragData } from "./drag-data";
import type { BlockDefinition } from "../types/block";
import type { EmailBlockNode } from "../types/document";
import type { BlockDragData } from "../types/editor";

interface EditorDndProps {
  blocks: EmailBlockNode[];
  definitions: BlockDefinition[];
  onInsertBlock: (type: string, index?: number) => void;
  onReorder: (activeId: string, overId: string) => void;
  onLibraryDragStart: () => void;
  children: ReactNode;
}

export function EditorDnd({
  blocks,
  definitions,
  onInsertBlock,
  onReorder,
  onLibraryDragStart,
  children,
}: EditorDndProps) {
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const [activeDrag, setActiveDrag] = useState<BlockDragData | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = readDragData(event.active.data.current);
    setActiveDrag(data ?? { kind: "canvas" });
    if (data?.kind === "library") onLibraryDragStart();
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const data = readDragData(event.active.data.current);
    const over = event.over;
    setActiveDrag(null);
    setOverId(null);
    if (!over) return;

    const overIdValue = String(over.id);
    if (data?.kind === "library") {
      onInsertBlock(data.type, resolveInsertIndex(blocksRef.current, overIdValue));
      return;
    }

    if (event.active.id === overIdValue) return;
    onReorder(String(event.active.id), overIdValue);
  };

  const overlayDefinition =
    activeDrag?.kind === "library"
      ? getBlockDefinition(activeDrag.type, definitions)
      : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDrag(null);
        setOverId(null);
      }}
    >
      <EditorDragContext.Provider value={{ overId }}>
        {children}
      </EditorDragContext.Provider>
      <DragOverlay>
        {overlayDefinition ? (
          <div className="ree-drag-overlay">
            <BlockIcon icon={overlayDefinition.icon} className="ree-lib-icon" />
            <span>{overlayDefinition.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
