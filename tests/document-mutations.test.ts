import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import type { EmailDocument } from "../src/types/document.ts";

// Node 直接执行内部模块时，补齐 bundler 使用的无扩展名相对导入。
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
const { updateBlockControls } = await import("../src/document/mutations.ts");
const { createEmailDocument } = await import("../src/document/create-document.ts");

test("批量字段补丁一次合并关联字段，隔离外部对象并保留其它区块与元数据", () => {
  const document: EmailDocument = createEmailDocument([
    { id: "product", type: "custom.product", controls: { name: "Original", price: 1, metadata: { source: "api" } } },
    { id: "other", type: "text", controls: { html: "<p>Unchanged</p>" } },
  ]);
  const patch = { name: "Bottle", price: 19, variants: [{ id: "blue" }] };
  const before = structuredClone(document);
  const next = updateBlockControls(document, "product", patch);
  assert.deepEqual(next.blocks[0].controls, { ...before.blocks[0].controls, ...patch });
  assert.equal(next.blocks[1], document.blocks[1]);
  patch.variants[0].id = "changed";
  assert.deepEqual(next.blocks[0].controls.variants, [{ id: "blue" }]);
  assert.deepEqual(document, before);

  const following = updateBlockControls(next, "product", { price: 20 });
  assert.equal(following.blocks[0].controls.name, "Bottle");
  assert.equal(following.blocks[0].controls.price, 20);
  assert.equal(updateBlockControls(following, "product", {}), following);
  assert.equal(updateBlockControls(following, "missing", patch), following);
});
