export type DropEdge = "before" | "after";

export interface DropTarget {
  id: string;
  edge: DropEdge;
}

export interface DropRect {
  id: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DropPoint {
  x: number;
  y: number;
}

function containsPoint(rect: DropRect, point: DropPoint): boolean {
  return point.x >= rect.left
    && point.x <= rect.right
    && point.y >= rect.top
    && point.y <= rect.bottom;
}

function edgeAt(rect: DropRect, y: number): DropEdge {
  const mid = (rect.top + rect.bottom) / 2;
  return y < mid ? "before" : "after";
}

/** droppable 注册顺序会停在首次挂载，这里改按视觉位置排。 */
export function sortDropRects(blocks: readonly DropRect[]): DropRect[] {
  return [...blocks].sort((left, right) => left.top - right.top || left.left - right.left);
}

export function resolveCanvasDrop(
  pointer: DropPoint,
  canvas: DropRect | null,
  blocks: readonly DropRect[],
): DropTarget | null {
  const ordered = sortDropRects(blocks);
  const hit = ordered.find((block) => containsPoint(block, pointer));
  if (hit) return { id: hit.id, edge: edgeAt(hit, pointer.y) };

  if (!canvas || !containsPoint(canvas, pointer)) return null;
  if (ordered.length === 0) return { id: canvas.id, edge: "after" };

  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  if (!first || !last) return { id: canvas.id, edge: "after" };
  if (pointer.y <= first.top) return { id: first.id, edge: "before" };
  if (pointer.y >= last.bottom) return { id: last.id, edge: "after" };

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const current = ordered[index];
    const next = ordered[index + 1];
    if (!current || !next) continue;
    if (pointer.y < current.bottom || pointer.y > next.top) continue;
    const mid = (current.bottom + next.top) / 2;
    return pointer.y < mid
      ? { id: current.id, edge: "after" }
      : { id: next.id, edge: "before" };
  }

  const beside = ordered.find((block) => pointer.y >= block.top && pointer.y <= block.bottom);
  if (beside) return { id: beside.id, edge: edgeAt(beside, pointer.y) };
  return { id: last.id, edge: "after" };
}

export function insertionIndex(
  blockIds: readonly string[],
  target: DropTarget,
  canvasId: string,
): number {
  if (target.id === canvasId) return blockIds.length;
  const index = blockIds.indexOf(target.id);
  if (index < 0) return blockIds.length;
  return target.edge === "after" ? index + 1 : index;
}

export interface DropCollision {
  destinationId: string;
  target: DropTarget;
}

/** 先按视觉位置排序，再计算排序目标。注册顺序不能当文档顺序。 */
export function resolveDropCollision(
  pointer: DropPoint,
  canvas: DropRect | null,
  blocks: readonly DropRect[],
  activeId: string,
  canvasId: string,
): DropCollision | null {
  const ordered = sortDropRects(blocks);
  const target = resolveCanvasDrop(pointer, canvas, ordered);
  if (!target) return null;
  return {
    destinationId: sortableDestinationId(
      ordered.map((block) => block.id),
      activeId,
      target,
      canvasId,
    ),
    target,
  };
}

export function sortableDestinationId(
  blockIds: readonly string[],
  activeId: string,
  target: DropTarget,
  canvasId: string,
): string {
  if (!blockIds.includes(activeId)) return target.id;
  if (target.id === activeId) return activeId;
  const remaining = blockIds.filter((id) => id !== activeId);
  const index = Math.min(
    Math.max(insertionIndex(remaining, target, canvasId), 0),
    blockIds.length - 1,
  );
  return blockIds[index] ?? activeId;
}

export function indicatorForDrop(
  blockIds: readonly string[],
  activeId: string,
  target: DropTarget,
  canvasId: string,
): DropTarget | null {
  if (target.id === activeId) return null;
  const ids = blockIds.includes(activeId)
    ? blockIds.filter((id) => id !== activeId)
    : blockIds;
  const index = insertionIndex(ids, target, canvasId);
  if (ids.length === 0) return null;
  if (index <= 0) {
    const id = ids[0];
    return id ? { id, edge: "before" } : null;
  }
  if (index >= ids.length) {
    const id = ids[ids.length - 1];
    return id ? { id, edge: "after" } : null;
  }
  const id = ids[index];
  return id ? { id, edge: "before" } : null;
}
