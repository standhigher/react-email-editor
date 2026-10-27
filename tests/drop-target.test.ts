import assert from "node:assert/strict";
import test from "node:test";
import {
  indicatorForDrop,
  insertionIndex,
  resolveCanvasDrop,
  resolveDropCollision,
  sortableDestinationId,
  type DropRect,
} from "../src/editor-dnd/drop-target.ts";

const canvasId = "canvas";

function rect(id: string, top: number, height: number, left = 100, width = 200): DropRect {
  return { id, top, bottom: top + height, left, right: left + width };
}

const canvas = rect(canvasId, 0, 800, 0, 400);
const blocks = [rect("a", 40, 80), rect("b", 140, 80), rect("c", 240, 100)];

test("区块上半部分插入到该区块之前", () => {
  const target = resolveCanvasDrop({ x: 150, y: 50 }, canvas, blocks);
  assert.deepEqual(target, { id: "a", edge: "before" });
  assert.equal(insertionIndex(["a", "b", "c"], target!, canvasId), 0);
});

test("区块下半部分插入到该区块之后", () => {
  const target = resolveCanvasDrop({ x: 150, y: 190 }, canvas, blocks);
  assert.deepEqual(target, { id: "b", edge: "after" });
  assert.equal(insertionIndex(["a", "b", "c"], target!, canvasId), 2);
  assert.deepEqual(
    indicatorForDrop(["a", "b", "c"], "lib-text", target!, canvasId),
    { id: "c", edge: "before" },
  );
});

test("最后一个区块下半部分和画布底部都追加到末尾", () => {
  const lowerHalf = resolveCanvasDrop({ x: 150, y: 300 }, canvas, blocks);
  const below = resolveCanvasDrop({ x: 150, y: 420 }, canvas, blocks);
  assert.deepEqual(lowerHalf, { id: "c", edge: "after" });
  assert.deepEqual(below, { id: "c", edge: "after" });
  assert.equal(insertionIndex(["a", "b", "c"], below!, canvasId), 3);
  assert.deepEqual(
    indicatorForDrop(["a", "b", "c"], "lib-text", below!, canvasId),
    { id: "c", edge: "after" },
  );
});

test("画布顶部空白插入到第一个区块之前", () => {
  const target = resolveCanvasDrop({ x: 20, y: 10 }, canvas, blocks);
  assert.deepEqual(target, { id: "a", edge: "before" });
});

test("区块外侧的画布区域按垂直位置落点", () => {
  const target = resolveCanvasDrop({ x: 20, y: 190 }, canvas, blocks);
  assert.deepEqual(target, { id: "b", edge: "after" });
});

test("间隙靠近下一个区块时插入到它前面", () => {
  const target = resolveCanvasDrop({ x: 150, y: 130 }, canvas, blocks);
  assert.deepEqual(target, { id: "b", edge: "before" });
});

test("空画布和画布外都不产生区块落点", () => {
  assert.deepEqual(
    resolveCanvasDrop({ x: 20, y: 20 }, canvas, []),
    { id: canvasId, edge: "after" },
  );
  assert.equal(resolveCanvasDrop({ x: 900, y: 20 }, canvas, blocks), null);
});

test("画布内排序会把底部落点换成目标序号", () => {
  const target = { id: "c", edge: "after" as const };
  assert.equal(sortableDestinationId(["a", "b", "c"], "a", target, canvasId), "c");
  assert.equal(
    sortableDestinationId(["a", "b", "c"], "a", { id: "c", edge: "before" }, canvasId),
    "b",
  );
  assert.equal(
    sortableDestinationId(["a", "b", "c"], "c", { id: "a", edge: "after" }, canvasId),
    "b",
  );
  assert.equal(sortableDestinationId(["a", "b", "c"], "c", { id: "c", edge: "after" }, canvasId), "c");
});

test("注册顺序和视觉顺序不一致时仍按从上到下落点", () => {
  const shuffled = [blocks[2]!, blocks[0]!, blocks[1]!];
  assert.deepEqual(
    resolveCanvasDrop({ x: 150, y: 50 }, canvas, shuffled),
    { id: "a", edge: "before" },
  );
  assert.deepEqual(
    resolveCanvasDrop({ x: 20, y: 420 }, canvas, shuffled),
    { id: "c", edge: "after" },
  );
  assert.deepEqual(
    resolveDropCollision({ x: 150, y: 50 }, canvas, shuffled, "c", canvasId),
    { destinationId: "a", target: { id: "a", edge: "before" } },
  );
});

test("拖动自身时不显示插入线", () => {
  assert.equal(
    indicatorForDrop(["a", "b", "c"], "b", { id: "b", edge: "before" }, canvasId),
    null,
  );
});
