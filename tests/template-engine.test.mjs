import assert from "node:assert/strict";
import test from "node:test";
import {
  BLOCK_TYPES, blockToHtml, createBlockNode, createEmailDocument, defaultTemplateEngine,
  documentToHtml, renderBlock, renderBlockContent, renderTemplatePreview, validateTemplate,
} from "../dist/index.js";
import { renderConfig } from "./helpers/render-config.mjs";

const data = { main_status: "In transit", customer_name: "Mark Twain" };
// 仅验证适配器接收的完整原文、数据与输出；Go 语义由消费方引擎负责。
const adapterCases = [
  ['{{if eq .main_status "In transit"}}YES{{else}}NO{{end}}', "YES"],
  ['{{if ne .main_status "Delivered"}}YES{{end}}', "YES"],
  ['{{if and .customer_name (not (eq .main_status "Delivered"))}}YES{{end}}', "YES"],
  ['{{or .customer_name .main_status}}', "Mark Twain"],
  ['{{len .customer_name}}', "10"],
  ['{{index . "customer_name"}}', "Mark Twain"],
  ['{{printf "%s" .customer_name}}', "Mark Twain"],
  ['{{.customer_name | printf "%s" | html}}', "Mark Twain"],
  ['{{range $i, $v := .products}}{{with $v}}{{$i}}:{{.name}}/{{$.customer_name}}{{end}}{{end}}', "0:Book/Mark Twain"],
  ['{{with $name := .customer_name}}{{$name}}{{end}}', "Mark Twain"],
];

test("默认基础引擎：字段、字面量、上下文、根变量与基础控制语句", () => {
  assert.equal(renderConfig().templateEngine, defaultTemplateEngine);
  assert.equal(renderTemplatePreview("{{.customer_name}}", data), "Mark Twain");
  assert.equal(renderTemplatePreview("{{.customer_name}}"), "{{.customer_name}}");
  assert.equal(renderTemplatePreview("{{.missing}}", {}), "");
  assert.equal(renderTemplatePreview('{{"a\\\"b"}} {{-3}} {{true}}', {}), 'a&quot;b -3 true');
  assert.equal(renderTemplatePreview(" A \n {{- .name -}} \n B ", { name: "N" }), " ANB ");
  assert.equal(renderTemplatePreview("{{if .ok}}{{.name}}{{else if .other}}other{{else}}none{{end}}", { ok: true, name: "N" }), "N");
  assert.equal(renderTemplatePreview("{{if .ok}}ok{{else if .other}}other{{else}}none{{end}}", { other: true }), "other");
  assert.equal(renderTemplatePreview("{{with .user}}{{.name}}/{{$.name}}{{else}}none{{end}}", { user: { name: "Child" }, name: "Root" }), "Child/Root");
  assert.equal(renderTemplatePreview("{{range .items}}{{with .user}}{{.name}}/{{$.name}}{{end}}{{else}}empty{{end}}", { items: [{ user: { name: "Child" } }], name: "Root" }), "Child/Root");
  assert.equal(renderTemplatePreview("{{range .items}}item{{else}}{{.name}}{{end}}", { items: [], name: "Empty" }), "Empty");
  assert.equal(renderTemplatePreview("{{range .items}}{{.}}{{end}}", { items: { b: "B", a: "A" } }), "AB");
  assert.equal(renderTemplatePreview("{{if .value}}YES{{else}}NO{{end}}", { value: {} }), "NO");
  assert.equal(renderTemplatePreview("{{with .missing}}YES{{else}}NO{{end}}", {}), "NO");
  assert.equal(renderTemplatePreview("{{.}}", { name: "Root" }), "[object Object]");
  assert.equal(renderTemplatePreview("{{$.name}}", { name: "Root" }), "Root");
});

test("默认引擎遇到未支持的表达式或结构时保留完整输入", () => {
  for (const [template] of adapterCases) {
    assert.equal(renderTemplatePreview(template, data), template);
    assert.equal(renderTemplatePreview(`{{.customer_name}} ${template}`, data), `{{.customer_name}} ${template}`);
  }
  for (const template of [
    '{{.customer_name | html}}', '{{html}}', '{{printf}}', '{{if .ready}}YES',
    '{{end}}tail', '{{else}}tail', '{{.name', '{{template "header" .}}',
    '{{define "header"}}{{.name}}{{end}}', '{{"hello }} world"}}',
    '{{if .ok}}a{{else}}b{{else}}c{{end}}',
    '{{range .items}}a{{else if .ok}}b{{end}}',
    '{{/* comment */}}{{.name}}',
  ]) assert.equal(renderTemplatePreview(template, data), template);
});

test("基础字段路径支持 Unicode 标识符及嵌套上下文", () => {
  const values = { 客户名: "张三", 用户: { 名称2: "李四" }, 商品: [{ 名称: "书" }] };
  assert.equal(renderTemplatePreview("{{.客户名}}/{{用户.名称2}}/{{$.客户名}}", values), "张三/李四/张三");
  assert.equal(renderTemplatePreview("{{with .用户}}{{.名称2}}/{{$.客户名}}{{end}}", values), "李四/张三");
  assert.equal(renderTemplatePreview("{{range .商品}}{{.名称}}/{{$.客户名}}{{end}}", values), "书/张三");
});

test("基础条件按对象类别判断真值，with 保留上下文规则", () => {
  const cases = [
    [new Date("2026-01-01"), true], [new Map(), false], [new Map([["a", 1]]), true],
    [new Set(), false], [new Set([1]), true], [{}, false], [{ name: "N" }, true],
    [[], false], [[1], true], [null, false], [false, false], ["", false], [0, false],
  ];
  for (const [value, truthy] of cases) {
    assert.equal(renderTemplatePreview("{{if .value}}YES{{else}}NO{{end}}", { value }), truthy ? "YES" : "NO");
    assert.equal(renderTemplatePreview("{{with .value}}YES{{else}}{{$.name}}{{end}}", { value, name: "NO" }), truthy ? "YES" : "NO");
  }
});

test("变量清单补点统一用于区块预览与发送，其他表达式和存储原文保持不变", () => {
  const block = createBlockNode(BLOCK_TYPES.html);
  block.controls.html = '{{  store_name }}|{{- 客户名 -}}|{{printf "%s" .name}}|{{unlisted}}';
  const original = structuredClone(block);
  const variables = [{ name: "{{  store_name }}", value: "Shop" }, { name: "{{- 客户名 -}}", value: "张三" }];
  const expected = '{{  .store_name }}|{{- .客户名 -}}|{{printf "%s" .name}}|{{unlisted}}';
  const templateEngine = { render(source, values) {
    assert.ok(source.includes(expected));
    assert.deepEqual(values, { store_name: "Shop", 客户名: "张三" });
    return "Rendered";
  } };
  const config = renderConfig({ templateEngine });
  const document = createEmailDocument([block]);
  assert.ok(config.toHtml(document, { variables }).includes(expected));
  assert.ok(config.toHtml(document, { variables, resolveHtmlTemplates: true }).includes("Rendered"));
  assert.ok(blockToHtml(block, undefined, "email", { variables }).includes(expected));
  assert.deepEqual(block, original);
  assert.equal(document.blocks[0].controls.html, original.controls.html);
});

test("渲染与校验将非 Error 异常归一化并保留 cause", () => {
  for (const thrown of ["Engine failed", { reason: "Failure" }, null, undefined, "", false, 0]) {
    const templateEngine = { render() { throw thrown; }, validate() { throw thrown; } };
    for (const invoke of [
      () => renderTemplatePreview("template", {}, { templateEngine }),
      () => validateTemplate("template", { templateEngine }),
    ]) assert.throws(invoke, (error) => error instanceof Error && error.message.length > 0 && error.cause === thrown);
  }
  const error = new Error("Validation failed");
  assert.throws(() => validateTemplate("", { templateEngine: { render: () => "", validate() { throw error; } } }), (caught) => caught === error);
});

test("外部引擎完整接管函数、管道及局部作用域，不先解析或自动校验", () => {
  const previewData = { ...data, products: [{ name: "Book" }] };
  for (const [template, expected] of adapterCases) {
    const templateEngine = {
      render(source, values) {
        assert.equal(this, templateEngine);
        assert.equal(source, template);
        assert.deepEqual(values, previewData);
        return expected;
      },
      validate() { assert.fail("渲染不应自动调用语法校验"); },
    };
    assert.equal(renderTemplatePreview(template, previewData, { templateEngine }), expected);
  }
  const constant = { render: (source, values) => { assert.deepEqual(values, {}); return `${source}:done`; } };
  assert.equal(renderTemplatePreview("{{printf}}", undefined, { templateEngine: constant }), "{{printf}}:done");
});

test("默认插值转义一次，外部引擎输出原样返回，异常不回退", () => {
  assert.equal(renderTemplatePreview("<p>{{.name}}</p>", { name: '<Mark & "Twain\'s">' }), "<p>&lt;Mark &amp; &quot;Twain&#39;s&quot;&gt;</p>");
  const html = "<p>&lt;Mark&gt; &amp; Twain</p>";
  assert.equal(renderTemplatePreview("{{.name | html}}", {}, { templateEngine: { render: () => html } }), html);
  const error = new Error("Engine failed");
  assert.throws(() => renderTemplatePreview("{{.name}}", {}, { templateEngine: { render() { throw error; } } }), (caught) => caught === error);
  assert.throws(() => renderTemplatePreview("", {}, { templateEngine: { render: () => 42 } }), /must return a string synchronously/);
});

test("独立模板渲染与区块渲染隔离外部引擎对数据的修改", () => {
  const previewData = { nested: { name: "Original" } };
  const templateEngine = { render(_template, values) { values.nested.name = "Changed"; return "done"; } };
  renderTemplatePreview("{{.nested.name}}", previewData, { templateEngine });
  assert.equal(previewData.nested.name, "Original");
  const block = createBlockNode(BLOCK_TYPES.html);
  block.defaultData = previewData;
  block.controls.html = "{{.nested.name}}";
  renderBlockContent(block, undefined, "canvas", { resolveHtmlTemplate: true, templateEngine });
  assert.equal(block.defaultData.nested.name, "Original");
});

test("文档、区块与配置使用相同引擎，保持数据优先级和模板持久化", () => {
  const block = createBlockNode(BLOCK_TYPES.html);
  const template = '{{if eq .main_status "In transit"}}YES{{end}}';
  block.controls.html = template;
  block.defaultData = { name: "Block", nested: { source: "Block" } };
  const document = createEmailDocument([block]);
  const original = structuredClone(document);
  const seen = [];
  const templateEngine = { render(source, values) { seen.push({ source, values }); return "<p>YES &amp; done</p>"; } };
  const config = renderConfig({ templateEngine });
  const options = {
    resolveHtmlTemplates: true,
    variables: [{ name: "{{ name }}", value: "Variable" }, { name: "{{ other }}", value: "Other" }],
    templateData: { name: "Global", status: "Global", nested: { source: "Global", other: true } },
  };
  const html = config.toHtml(document, options);
  assert.match(html, /<p>YES &amp; done<\/p>/);
  assert.deepEqual(seen[0], { source: renderBlock(block), values: { name: "Block", other: "Other", status: "Global", nested: { source: "Block" } } });
  assert.equal(documentToHtml(document, undefined, { ...options, templateEngine }), html);
  for (const mode of ["canvas", "email"]) {
    assert.equal(renderBlockContent(block, undefined, mode, { resolveHtmlTemplate: true, templateEngine }), "<p>YES &amp; done</p>");
    assert.match(blockToHtml(block, undefined, mode, { resolveHtmlTemplate: true, templateEngine }), /<p>YES &amp; done<\/p>/);
  }
  const count = seen.length;
  assert.ok(config.toHtml(document).includes(template));
  assert.ok(documentToHtml(document, undefined, { templateEngine }).includes(template));
  assert.equal(seen.length, count);
  assert.ok(config.toHtml(document, { resolveHtmlTemplates: true, templateEngine: defaultTemplateEngine }).includes(template));
  assert.equal(seen.length, count);
  assert.deepEqual(document, original);
  assert.ok(JSON.stringify(document).includes('eq .main_status'));
});

test("语法校验仅显式调用，区分不支持与通过，保留外部异常", () => {
  assert.equal(validateTemplate("{{.name}}"), undefined);
  assert.equal(validateTemplate("anything", { templateEngine: { render: () => "" } }), undefined);
  const issues = [{ message: "Unexpected end", offset: 12 }];
  const template = "{{if .name}}";
  const templateEngine = {
    render() { assert.fail("校验不应渲染"); },
    validate(source) { assert.equal(this, templateEngine); return source === template ? issues : []; },
  };
  assert.deepEqual(validateTemplate(template, { templateEngine }), issues);
  assert.deepEqual(validateTemplate("{{.name}}", { templateEngine }), []);
  assert.throws(() => validateTemplate("", { templateEngine: { render: () => "", validate: () => Promise.resolve([]) } }), /must return an array synchronously/);
  assert.throws(() => validateTemplate("", { templateEngine: { render: () => "", validate() { throw new Error("Validation failed"); } } }), /Validation failed/);
});
