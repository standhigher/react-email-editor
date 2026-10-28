import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as api from "../dist/index.js";

const removedIdentifiers = new Set([
  "createEmailEditorConfig", "EmailEditorHandle", "EmailEditorConfigOptions", "useEditorHandle",
  "defaultFields", "field", "fields", "setField", "setFields", "FieldConfig", "FieldType",
  "resolveBlockStyleFields", "BlockRenderOptionsInput", "normalizeBlockRenderOptions",
]);

test("发布包不再暴露旧配置入口，渲染只接受对象参数", () => {
  for (const name of removedIdentifiers) assert.equal(name in api, false, name);
  const block = api.createBlockNode("html");
  block.controls.html = "<p>{{.name}}</p>";
  block.defaultData = { name: "Current" };
  for (const render of [api.blockToHtml, api.renderBlockContent]) {
    assert.match(render(block, undefined, "email", { resolveHtmlTemplate: true }), /<p>Current<\/p>/);
    assert.match(render(block, undefined, "email"), /\{\{.name\}\}/);
    for (const value of [true, false]) {
      assert.throws(() => render(block, undefined, "email", value), /Block render options must be an object/);
    }
  }
});

test("源码不再声明或读取旧 API 字段，避免重新引入兼容层", () => {
  const root = new URL("../src/", import.meta.url);
  const issues = [];
  for (const file of readdirSync(root, { recursive: true }).filter((name) => /\.tsx?$/.test(name))) {
    const source = ts.createSourceFile(file, readFileSync(new URL(file, root), "utf8"), ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (ts.isIdentifier(node) && removedIdentifiers.has(node.text)) issues.push(`${file}: ${node.text}`);
      // React 错误边界的 render() 生命周期有效；插件的旧 render 属性入口无效。
      if ((ts.isPropertyAccessExpression(node) || ts.isPropertyAssignment(node) || ts.isPropertySignature(node)) && node.name?.getText(source) === "render") {
        issues.push(`${file}: render property`);
      }
      if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression) && (removedIdentifiers.has(node.argumentExpression.text) || node.argumentExpression.text === "render")) {
        issues.push(`${file}: ${node.argumentExpression.text} access`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  assert.deepEqual(issues, []);
});
