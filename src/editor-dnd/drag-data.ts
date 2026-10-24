import type { BlockDragData } from "../types/editor";

export function readDragData(data: unknown): BlockDragData | undefined {
  if (!data || typeof data !== "object" || !("kind" in data)) return undefined;
  const record = data as { kind?: unknown; type?: unknown };
  if (record.kind === "library" && typeof record.type === "string") {
    return { kind: "library", type: record.type };
  }
  if (record.kind === "canvas") return { kind: "canvas" };
  return undefined;
}
