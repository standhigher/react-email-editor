import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { DRAG_ACTIVATION_DISTANCE, CANVAS_DROP_ID } from "../constants/editor";
import { BlockIcon } from "../components/BlockIcon";
import { getBlockDefinition } from "../document/registry";
import { canvasDropCollision, readDropTarget } from "./collision";
import { EditorDragContext } from "./drag-context";
import { readDragData } from "./drag-data";
import { indicatorForDrop, insertionIndex, type DropTarget } from "./drop-target";
import type { BlockDefinition } from "../types/block";
import type { EmailBlockNode } from "../types/document";
import type { BlockDragData } from "../types/editor";

interface EditorDndProps {
  blocks: EmailBlockNode[];
  definitions: readonly BlockDefinition[];
  onInsertBlock: (type: string, index?: number) => void;
  onReorder: (activeId: string, overId: string) => void;
  onLibraryDragStart: () => void;
  children: ReactNode;
}

function sameDrop(current: DropTarget | null, next: DropTarget | null): boolean {
  return current?.id === next?.id && current?.edge === next?.edge;
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
  useLayoutEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  const [activeDrag, setActiveDrag] = useState<BlockDragData | null>(null);
  const [indicator, setIndicator] = useState<DropTarget | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
  );

  const updateIndicator = (activeId: string, collisions: DragMoveEvent["collisions"]) => {
    const target = readDropTarget(collisions);
    const next = target
      ? indicatorForDrop(
          blocksRef.current.map((block) => block.id),
          activeId,
          target,
          CANVAS_DROP_ID,
        )
      : null;
    setIndicator((current) => (sameDrop(current, next) ? current : next));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = readDragData(event.active.data.current);
    setActiveDrag(data ?? { kind: "canvas" });
    setIndicator(null);
    if (data?.kind === "library") onLibraryDragStart();
  };

  const handleDragMove = (event: DragMoveEvent) => {
    updateIndicator(String(event.active.id), event.collisions);
  };

  const clearDrag = () => {
    setActiveDrag(null);
    setIndicator(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const data = readDragData(event.active.data.current);
    const target = readDropTarget(event.collisions);
    const overId = event.over ? String(event.over.id) : null;
    clearDrag();

    if (data?.kind === "library") {
      if (!target) return;
      onInsertBlock(
        data.type,
        insertionIndex(
          blocksRef.current.map((block) => block.id),
          target,
          CANVAS_DROP_ID,
        ),
      );
      return;
    }

    if (!overId || event.active.id === overId) return;
    onReorder(String(event.active.id), overId);
  };

  const overlayDefinition =
    activeDrag?.kind === "library"
      ? getBlockDefinition(activeDrag.type, definitions)
      : undefined;
  const dragState = useMemo(
    () => ({
      targetId: indicator?.id ?? null,
      dropEdge: indicator?.edge ?? null,
    }),
    [indicator],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={canvasDropCollision}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDrag}
    >
      <EditorDragContext.Provider value={dragState}>
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
