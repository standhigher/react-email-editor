import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  defineBlock, EmailControls, createEmailEditorConfig, createEmailDocument,
  renderBlockContent, resolveEmailBody, DEFAULT_BLOCKS, buildRenderContext,
} from '../dist/index.js';

function card(overrides = {}) {
  return defineBlock({
    type: 'test.card', title: 'Card',
    controls: { title: EmailControls.text({ label: 'Title', defaultValue: 'Default' }) },
    renderEmail: ({ controls, email }) => email.html`<p>${controls.title}</p>`,
    ...overrides,
  });
}

test('同一配置用于区块注册、节点创建、JSON 恢复及独立导出', () => {
  const config = createEmailEditorConfig({ plugins: [card()] });
  const document = createEmailDocument([config.createBlock('test.card')]);
  assert.equal(document.version, 4);
  assert.deepEqual(document.blocks[0].controls, { title: 'Default' });
  assert.equal('fields' in document.blocks[0], false);
  const context = buildRenderContext(document.blocks[0], 'canvas', document.body, config.definitions.find((plugin) => plugin.type === 'test.card'));
  assert.deepEqual(context.controls, document.blocks[0].controls);
  assert.equal('fields' in context, false);
  assert.match(config.toHtml(JSON.parse(JSON.stringify(document))), /<p>Default<\/p>/);
  assert.equal(config.library.length, DEFAULT_BLOCKS.length + 1);
  assert.throws(() => config.createBlock('unknown'), /Unknown block plugin/);
});

test('v4 拒绝使用 fields 的旧版本文档，不提供自动迁移', () => {
  const config = createEmailEditorConfig({ plugins: [card()] });
  const legacy = { ...createEmailDocument(), version: 3, blocks: [{ id: 'old', type: 'test.card', fields: { title: 'Legacy' } }] };
  const before = JSON.stringify(legacy);
  assert.throws(() => config.validate(legacy), /Unsupported email document version: 3/);
  assert.throws(() => config.toHtml(legacy), /Unsupported email document version: 3/);
  assert.equal(JSON.stringify(legacy), before);
});

test('内置区块可隐藏和排序，隐藏不妨碍旧节点渲染；覆盖必须显式声明', () => {
  const config = createEmailEditorConfig({ builtins: ['image', 'text'], plugins: [card()] });
  assert.deepEqual(config.library.map((plugin) => plugin.type), ['image', 'text', 'test.card']);
  assert.match(config.toHtml(createEmailDocument([config.createBlock('heading')])), /Heading/);
  assert.equal(createEmailEditorConfig({ builtins: false }).library.length, 0);
  assert.throws(() => createEmailEditorConfig({ plugins: [card(), card()] }), /Duplicate/);
  assert.throws(() => createEmailEditorConfig({ plugins: [card({ type: 'text' })] }), /override/);
  const override = createEmailEditorConfig({ plugins: [card({ type: 'text', override: true })] });
  assert.match(override.toHtml(createEmailDocument([override.createBlock('text')])), /Default/);
  assert.throws(() => createEmailEditorConfig({ builtins: ['oops'] }), /Unknown builtin/);
  assert.throws(() => createEmailEditorConfig({ builtins: ['text', 'text'] }), /Duplicate/);
});

test('嵌套字段和模板样例深拷贝，字段默认值只补缺失值', () => {
  const custom = EmailControls.custom({ label: 'Object', defaultValue: { tags: ['A'] }, read: (value) => value, component: () => null });
  const plugin = card({
    controls: {
      object: custom,
      list: EmailControls.list({ label: 'List', controls: { title: EmailControls.text({ label: 'Title', defaultValue: 'Item' }) }, defaultValue: [{ title: 'First' }] }),
      count: EmailControls.number({ label: 'Count', defaultValue: 5 }),
      enabled: EmailControls.boolean({ label: 'Enabled', defaultValue: true }),
      title: EmailControls.text({ label: 'Title', defaultValue: 'Fallback' }),
    },
    defaultData: { products: [{ name: 'Cup' }] },
    renderEmail: ({ controls }) => JSON.stringify(controls),
  });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  const first = config.createBlock(plugin.type);
  const second = config.createBlock(plugin.type);
  first.controls.object.tags.push('B');
  first.controls.list[0].title = 'Changed';
  first.defaultData.products[0].name = 'Changed';
  assert.deepEqual(second.controls.object.tags, ['A']);
  assert.equal(second.controls.list[0].title, 'First');
  assert.equal(second.defaultData.products[0].name, 'Cup');
  const controls = plugin.readControls({ count: 0, enabled: false, title: '', extra: 'kept' });
  assert.equal(controls.count, 0); assert.equal(controls.enabled, false); assert.equal(controls.title, '');
  assert.equal(controls.extra, 'kept');
  assert.equal(controls.list[0].title, 'First');
});

test('声明的容器能力控制创建和导出，样式控件默认值实际生效', () => {
  const plugin = card({
    containerStyles: { appearance: false },
    styleControls: [{ id: 'dimension.padding', group: 'dimension', label: 'Padding', control: 'spacing', defaultValue: '12px' }],
    defaultStyle: { decorations: { backgroundColor: '#ff0000' } },
  });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  const block = config.createBlock(plugin.type);
  assert.equal(block.style.dimension.padding, '12px');
  assert.equal(block.style.decorations, undefined);
  const html = config.toHtml(createEmailDocument([block]));
  assert.match(html, /padding:12px/); assert.doesNotMatch(html, /#ff0000/);
});

test('模板在自定义画布与预览统一解析，导出保留变量及表达式', () => {
  const plugin = card({ defaultData: { name: 'Alice' }, renderEmail: ({ email }) => email.html`<p>{{ .name }}</p>` });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  const block = config.createBlock(plugin.type);
  const document = createEmailDocument([block]);
  const canvas = renderBlockContent(block, config.definitions, 'canvas', { resolveHtmlTemplate: true });
  assert.equal(canvas, '<p>Alice</p>');
  assert.match(config.toHtml(document), /{{ .name }}/);
  assert.match(config.toHtml(document, { resolveHtmlTemplates: true }), /Alice/);
});

test('HTML 工具转义普通插值，显式富文本和布局工具保留 HTML', () => {
  const plugin = card({ renderEmail: ({ email }) => email.html`
    <p>${'<script>evil</script>'}</p>
    ${email.richText('<p><strong>Rich</strong></p>')}
    ${email.table([[email.html`<b>Cell</b>`]])}
    ${email.image({ src: 'javascript:alert(1)', alt: '"quoted"' })}
    ${email.button({ href: 'java\nscript:evil', label: '<Buy>' })}
    ${{ html: '<script>spoof</script>' }}
    {{printf "%s" .name}}
  ` });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  const html = config.toHtml(createEmailDocument([config.createBlock(plugin.type)]));
  assert.match(html, /&lt;script&gt;evil&lt;\/script&gt;/);
  assert.match(html, /<strong>Rich<\/strong>/);
  assert.match(html, /<td><b>Cell<\/b><\/td>/);
  assert.match(html, /&quot;quoted&quot;/);
  assert.doesNotMatch(html, /javascript:|java\nscript:|<script>spoof/);
  assert.match(html, /{{printf "%s" .name}}/);
});

test('字段校验支持嵌套路径；邮件导出失败时保留原始文档并提供区块信息', () => {
  const plugin = card({ controls: { rows: EmailControls.list({ label: 'Rows', controls: { value: EmailControls.text({ label: 'Value', validate: (value) => value ? undefined : 'Required' }) } }) }, renderEmail: () => '<p>Test</p>' });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  const block = config.createBlock(plugin.type);
  block.controls.rows = [{ value: '' }];
  const document = createEmailDocument([block]);
  const json = JSON.stringify(document);
  assert.throws(() => config.toHtml(document), /test.card.*rows\[0\].value: Required/);
  assert.equal(JSON.stringify(document), json);
  const missing = createEmailDocument([{ id: 'lost', type: 'missing', controls: { content: 'original' } }]);
  assert.throws(() => config.toHtml(missing), /Missing block plugin: missing/);
  assert.equal(missing.blocks[0].controls.content, 'original');
});

test('React Canvas 与 Inspector 获得类型化字段和不可变更新入口', () => {
  let canvasProps;
  let inspectorProps;
  const plugin = card({
    Canvas: (props) => { canvasProps = props; return createElement('p', null, props.controls.title); },
    Inspector: (props) => { inspectorProps = props; return createElement('p', null, props.controls.title); },
  });
  const updates = [];
  const props = { controls: plugin.readControls({}), body: resolveEmailBody(), setControl: (name, value) => updates.push([name, value]) };
  assert.match(renderToStaticMarkup(createElement(plugin.canvas, props)), /Default/);
  renderToStaticMarkup(createElement(plugin.inspector, props));
  canvasProps.setControl('title', 'Canvas'); inspectorProps.setControl('title', 'Inspector');
  assert.deepEqual(updates, [['title', 'Canvas'], ['title', 'Inspector']]);
});

test('自定义控件在 React 中挂载，渲染异常包含原始区块定位信息', () => {
  const spec = EmailControls.text({ label: 'Title', defaultValue: 'Default', component: ({ value, label }) => createElement('label', null, label, createElement('input', { value, readOnly: true })) });
  assert.match(renderToStaticMarkup(spec.renderControl({ value: 'Custom', label: 'Title', onChange: () => {} })), /value="Custom"/);
  const plugin = card({ renderEmail: () => { throw new Error('Broken template'); } });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  assert.throws(() => config.toHtml(createEmailDocument([config.createBlock(plugin.type)])), /test.card.*Broken template/);
});

test('插件渲染收到独立快照，误修改上下文不会污染文档或主体', () => {
  const plugin = card({
    controls: { rows: EmailControls.list({ label: 'Rows', defaultValue: [{ title: 'Original' }], controls: { title: EmailControls.text({ label: 'Title' }) } }) },
    renderEmail: ({ controls, block, style, body }) => {
      controls.rows[0].title = 'Mutated';
      block.controls.rows[0].title = 'Mutated block';
      style.dimension.padding = '99px';
      body.contentWidth = 999;
      return '<p>Snapshot</p>';
    },
  });
  const config = createEmailEditorConfig({ plugins: [plugin] });
  const document = createEmailDocument([config.createBlock(plugin.type)]);
  const before = JSON.stringify(document);
  config.toHtml(document);
  assert.equal(JSON.stringify(document), before);
});
