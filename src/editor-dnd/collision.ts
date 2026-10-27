import type { Collision, CollisionDetection } from "@dnd-kit/core";
import { CANVAS_DROP_ID } from "../constants/editor";
import {
  resolveDropCollision,
  type DropRect,
  type DropTarget,
} from "./drop-target";

function toDropRect(
  id: string,
  rect: { top: number; bottom: number; left: number; right: number },
): DropRect {
  return {
    id,
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
  };
}

export function readDropTarget(collisions: Collision[] | null | undefined): DropTarget | null {
  const data = collisions?.[0]?.data;
  if (!data || typeof data !== "object") return null;
  const targetId = data.targetId;
  const edge = data.edge;
  if (typeof targetId !== "string") return null;
  if (edge !== "before" && edge !== "after") return null;
  return { id: targetId, edge };
}

export const canvasDropCollision: CollisionDetection = ({
  active,
  droppableContainers,
  droppableRects,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) return [];

  let canvas: DropRect | null = null;
  const blocks: DropRect[] = [];
  for (const container of droppableContainers) {
    const id = String(container.id);
    const rect = droppableRects.get(container.id);
    if (!rect) continue;
    if (id === CANVAS_DROP_ID) {
      canvas = toDropRect(id, rect);
      continue;
    }
    blocks.push(toDropRect(id, rect));
  }

  const resolved = resolveDropCollision(pointerCoordinates, canvas, blocks, String(active.id), CANVAS_DROP_ID);
  if (!resolved) return [];

  const collision: Collision = {
    id: resolved.destinationId,
    data: {
      value: 0,
      edge: resolved.target.edge,
      targetId: resolved.target.id,
    },
  };
  return [collision];
};
