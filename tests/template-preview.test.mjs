import assert from "node:assert/strict";
import test from "node:test";
import {
  BLOCK_TYPES,
  createBlockNode,
  createEmailDocument,
  documentToHtml,
  renderTemplatePreview,
  variablesToTemplateData,
} from "../dist/index.js";

const storeVariable = { name: "{{  store_name }}", description: "", value: "店铺名称" };
const userVariable = { name: "{{ user.name }}", value: "Ada" };
const trimmedVariable = { name: "{{- store_name -}}", value: "店铺名称" };

test("编辑保留变量原文，预览替换 value，导出只给变量列表补点", () => {
  assert.deepEqual(variablesToTemplateData([storeVariable]), { store_name: "店铺名称" });
  assert.deepEqual(variablesToTemplateData([userVariable]), { user: { name: "Ada" } });

  const document = createEmailDocument([createBlockNode(BLOCK_TYPES.text)]);
  document.blocks[0].fields.html = [
    "<p>{{  store_name }}</p>",
    "<p>{{  other_name }}</p>",
    "<p>{{- store_name -}}</p>",
    "<p>{{if not .ready}}{{printf \"%s\" .name}}{{/* comment */}}{{end}}</p>",
  ].join("");

  const html = documentToHtml(document, undefined, { variables: [storeVariable] });
  assert.match(html, /\{\{  \.store_name \}\}/);
  assert.match(html, /\{\{  other_name \}\}/);
  assert.match(html, /\{\{- store_name -\}\}/);
  assert.match(html, /\{\{if not \.ready\}\}/);
  assert.match(html, /\{\{printf "%s" \.name\}\}/);
  assert.match(html, /\{\{\/\* comment \*\/\}\}/);
  assert.doesNotMatch(html, /\.printf|\.not|\.\/\*/);
  assert.doesNotMatch(html, /店铺名称/);

  const preview = documentToHtml(document, undefined, {
    resolveHtmlTemplates: true,
    variables: [storeVariable, userVariable],
  });
  assert.match(preview, /店铺名称/);
  assert.doesNotMatch(preview, /\{\{  store_name \}\}/);

  assert.equal(
    renderTemplatePreview("{{ user.name }}", variablesToTemplateData([userVariable])),
    "Ada",
  );
  assert.equal(
    renderTemplatePreview("{{printf \"%s\" .name}}"),
    "{{printf \"%s\" .name}}",
  );
  assert.equal(
    renderTemplatePreview(
      "{{if .has_products}}{{range .products}}<p>{{.name}}</p>{{end}}{{else}}<p>none</p>{{end}}",
      { has_products: true, products: [{ name: "示例商品" }] },
    ),
    "<p>示例商品</p>",
  );

  const trimmed = createEmailDocument([createBlockNode(BLOCK_TYPES.text)]);
  trimmed.blocks[0].fields.html = "<p>{{- store_name -}}</p>";
  const trimmedHtml = documentToHtml(trimmed, undefined, { variables: [trimmedVariable] });
  assert.match(trimmedHtml, /\{\{- \.store_name -\}\}/);
});
