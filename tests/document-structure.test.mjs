import assert from "node:assert/strict";
import test from "node:test";
import { createBlockNode, createEmailDocument, documentToHtml, resolveEmailBody } from "../dist/index.js";
import { renderConfig } from "./helpers/render-config.mjs";

test("文档接入按实际结构报错，版本号不能绕过结构检查", () => {
  const config = renderConfig();
  const document = createEmailDocument([createBlockNode("text")]);
  const block = document.blocks[0];
  const cases = [
    [null, /expected an object/],
    [[], /expected an object/],
    [{}, /blocks must be an array/],
    [{ ...document, blocks: {} }, /blocks must be an array/],
    [{ ...document, body: [] }, /body must be an object/],
    [{ ...document, body: "invalid" }, /body must be an object/],
    [{ ...document, subject: 123 }, /subject must be a string/],
    [{ ...document, blocks: [null] }, /blocks\[0\] must be an object/],
    [{ ...document, blocks: [[]] }, /blocks\[0\] must be an object/],
    [{ ...document, blocks: [undefined] }, /blocks\[0\] must be an object/],
    [{ ...document, blocks: [{ ...block, id: undefined }] }, /blocks\[0\]\.id/],
    [{ ...document, blocks: [{ ...block, id: " " }] }, /blocks\[0\]\.id/],
    [{ ...document, blocks: [{ ...block, type: 123 }] }, /blocks\[0\]\.type/],
    [{ ...document, blocks: [{ ...block, type: "" }] }, /blocks\[0\]\.type/],
    [{ ...document, blocks: [{ ...block, controls: undefined }] }, /blocks\[0\]\.controls/],
    [{ ...document, blocks: [{ ...block, controls: null }] }, /blocks\[0\]\.controls/],
    [{ ...document, blocks: [{ ...block, controls: [] }] }, /blocks\[0\]\.controls/],
  ];
  for (const [input, error] of cases) {
    assert.throws(() => config.validate(input), error);
    assert.throws(() => config.toHtml(input), error);
    assert.throws(() => documentToHtml(input), error);
  }
});

test("接入保留主体默认值归一化和插件控件默认值，不修改原数据", () => {
  const config = renderConfig();
  const block = createBlockNode("text");
  block.controls = {};
  for (const body of [undefined, null, {}, { contentWidth: 999, textColor: "invalid" }]) {
    const document = { version: 5, blocks: [block], body };
    const before = structuredClone(document);
    const expected = { ...document, body: resolveEmailBody(body) };
    assert.deepEqual(config.validate(document), []);
    assert.equal(documentToHtml(document), documentToHtml(expected));
    assert.deepEqual(document, before);
  }
});
