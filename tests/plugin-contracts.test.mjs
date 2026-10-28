import { renderConfig } from "./helpers/render-config.mjs";
import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  buildRenderContext, createEmailDocument, defineBlock,
  EmailControls, renderBlockContent, resolveEmailBody,
} from '../dist/index.js';

function configFor(controls, options = {}) {
  const plugin = defineBlock({
    type: 'contract.card', title: 'Card', controls: controls,
    renderEmail: ({ email }) => email.html`<p>Card</p>`, ...options,
  });
  const config = renderConfig({ plugins: [plugin] });
  return { plugin, config, block: config.createBlock(plugin.type) };
}

test('内置字段约束同时用于预检和邮件导出，草稿与原始数据保留', () => {
  const { config, block } = configFor({
    price: EmailControls.number({ label: 'Price', min: 0, max: 100 }),
    mode: EmailControls.select({ label: 'Mode', options: [{ label: 'One', value: 'one' }] }),
    link: EmailControls.url({ label: 'Link' }),
    image: EmailControls.image({ label: 'Image' }),
    rows: EmailControls.list({ label: 'Rows', min: 1, max: 2, controls: { count: EmailControls.number({ label: 'Count', min: 1 }) } }),
  });
  Object.assign(block.controls, { price: -1, mode: 'unknown', link: 'javascript:evil', image: 'mailto:bad', rows: [] });
  const document = createEmailDocument([block]);
  const before = JSON.stringify(document);
  const issues = config.validate(document);
  assert.deepEqual(issues.map((issue) => issue.controlPath), ['price', 'mode', 'link', 'image', 'rows']);
  assert.ok(issues.every((issue) => issue.blockId === block.id && issue.blockType === block.type));
  assert.throws(() => config.toHtml(document), /price: Must be at least 0/);
  assert.doesNotThrow(() => renderBlockContent(block, config.definitions, 'canvas'));
  assert.equal(JSON.stringify(document), before);
  block.controls.price = 101;
  assert.match(config.validate(document)[0].message, /at most 100/);
  block.controls.rows = [{ count: 0 }, { count: 0 }, { count: 0 }];
  assert.deepEqual(config.validate(document).filter((issue) => issue.controlPath.startsWith('rows')).map((issue) => issue.controlPath), ['rows', 'rows[0].count', 'rows[1].count', 'rows[2].count']);
  for (const value of [Number.NaN, Infinity, 'wrong', '', null]) {
    block.controls.price = value;
    assert.match(config.validate(document).find((issue) => issue.controlPath === 'price').message, /finite number/);
  }
});

test('空 URL 与选项保持可选，合法模板和边界数字允许导出，业务校验继续生效', () => {
  const { config, block } = configFor({
    count: EmailControls.number({ label: 'Count', min: 0, max: 10, validate: (value) => value === 5 ? 'Reserved' : undefined }),
    link: EmailControls.url({ label: 'Link' }), image: EmailControls.image({ label: 'Image' }),
    mode: EmailControls.select({ label: 'Mode', options: [{ label: 'One', value: 'one' }] }),
  });
  const document = createEmailDocument([block]);
  assert.deepEqual(config.validate(document), []);
  Object.assign(block.controls, { count: '10', link: '{{ .url }}', image: 'cid:photo', mode: 'one' });
  assert.deepEqual(config.validate(document), []);
  assert.doesNotThrow(() => config.toHtml(document));
  block.controls.count = 5;
  assert.equal(config.validate(document)[0].message, 'Reserved');
});

test('预检汇总多个区块、缺失插件和字段解析异常，不调用渲染器', () => {
  let renders = 0;
  const { config, block } = configFor({
    broken: EmailControls.custom({ label: 'Broken', defaultValue: '', read: () => { throw new Error('Cannot parse'); }, component: () => null }),
    count: EmailControls.number({ label: 'Count', min: 1 }),
  }, { renderEmail: () => { renders++; return ''; } });
  const second = config.createBlock(block.type);
  const document = createEmailDocument([block, second, { id: 'missing', type: 'lost', controls: {} }]);
  assert.deepEqual(config.validate(document).map((issue) => [issue.blockId, issue.controlPath]), [[block.id, 'broken'], [block.id, 'count'], [second.id, 'broken'], [second.id, 'count'], ['missing', '']]);
  assert.equal(renders, 0);
});

test('归一化后邮件、组件适配、校验和自定义控件不重复读取字段', () => {
  let reads = 0;
  let received;
  const payload = EmailControls.custom({
    label: 'Payload', defaultValue: { amount: 0 },
    read: (value) => { reads++; return { amount: typeof value === 'string' ? Number(value) : value.amount }; },
    validate: (value) => value.amount < 0 ? 'Invalid amount' : undefined,
    component: ({ value }) => createElement('p', null, value.amount),
  });
  const { plugin, config, block } = configFor({ payload }, {
    Canvas: (props) => { received = props; return createElement('p', null, props.controls.payload.amount); },
    Inspector: (props) => createElement('p', null, props.controls.payload.amount),
    renderEmail: ({ controls, email }) => email.html`<p>${controls.payload.amount}</p>`,
  });
  block.controls.payload = '12';
  const document = createEmailDocument([block]);
  reads = 0;
  assert.match(config.toHtml(document), /<p>12<\/p>/);
  assert.equal(reads, 1);
  reads = 0;
  assert.deepEqual(config.validate(document), []);
  assert.equal(reads, 1);
  reads = 0;
  const context = buildRenderContext(block, 'canvas', resolveEmailBody(), plugin);
  assert.match(renderToStaticMarkup(createElement(plugin.canvas, { ...context })), /12/);
  assert.match(renderToStaticMarkup(createElement(plugin.inspector, { ...context })), /12/);
  assert.match(renderToStaticMarkup(payload.renderControl({ value: received.controls.payload, label: 'Payload' })), /12/);
  assert.equal(reads, 1);
  assert.equal(block.controls.payload, '12');
});

test('声明及配置元数据是隔离快照，外部修改不改变创建与导出', () => {
  const choices = [{ label: 'One', value: 'one' }];
  const defaults = { tags: ['first'] };
  const styles = { dimension: { padding: '8px' } };
  const data = { name: 'Original' };
  const options = {
    type: 'snapshot.card', title: 'Original', defaultStyle: styles, defaultData: data,
    controls: {
      mode: EmailControls.select({ label: 'Mode', defaultValue: 'one', options: choices }),
      payload: EmailControls.custom({ label: 'Payload', defaultValue: defaults, read: (value) => value, component: () => null }),
    },
    renderEmail: ({ controls }) => `<p>${controls.payload.tags.join(',')}</p>`,
  };
  const plugin = defineBlock(options);
  const plugins = [plugin];
  const builtins = ['text'];
  const config = renderConfig({ plugins, builtins });
  choices[0].value = 'changed'; defaults.tags.push('changed'); styles.dimension.padding = '99px'; data.name = 'Changed';
  options.renderEmail = () => '<p>Changed</p>'; options.title = 'Changed'; plugins.length = 0; builtins.length = 0;
  assert.equal(config.library.length, 2);
  assert.equal(config.definitions.find((item) => item.type === plugin.type).title, 'Original');
  assert.throws(() => config.definitions.splice(0, 1), TypeError);
  assert.throws(() => config.library.push(plugin), TypeError);
  assert.throws(() => { config.definitions.find((item) => item.type === plugin.type).defaultData.name = 'Changed'; }, TypeError);
  assert.throws(() => { plugin.schema.mode.options[0].value = 'Changed'; }, TypeError);
  const block = config.createBlock(plugin.type);
  assert.equal(block.style.dimension.padding, '8px');
  assert.equal(block.defaultData.name, 'Original');
  assert.deepEqual(block.controls.payload.tags, ['first']);
  assert.deepEqual(config.validate(createEmailDocument([block])), []);
  assert.match(config.toHtml(createEmailDocument([block])), /<p>first<\/p>/);
});

test('嵌套列表归一化保留未知字段，防止编辑声明字段时丢失业务元数据', () => {
  const { plugin } = configFor({ rows: EmailControls.list({ label: 'Rows', controls: { name: EmailControls.text({ label: 'Name' }) } }) });
  const raw = { rows: [{ id: 'product-1', name: 123, metadata: { external: true } }] };
  const values = plugin.readControls(raw);
  assert.deepEqual(values.rows[0], { id: 'product-1', name: '123', metadata: { external: true } });
  values.rows[0].metadata.external = false;
  assert.equal(raw.rows[0].metadata.external, true);
});

test('Canvas 和 Inspector 的 setControls 将整组字段作为一次操作转交宿主', () => {
  let received;
  const { plugin } = configFor({ name: EmailControls.text({ label: 'Name' }), price: EmailControls.number({ label: 'Price' }) }, {
    Canvas: (props) => { received = props; return null; },
    Inspector: (props) => { received = props; return null; },
  });
  const calls = [];
  const props = { controls: plugin.readControls({}), setControls: (patch) => calls.push(patch) };
  for (const Component of [plugin.canvas, plugin.inspector]) {
    renderToStaticMarkup(createElement(Component, props));
    received.setControls({ name: 'Bottle', price: 19 });
  }
  assert.deepEqual(calls, [{ name: 'Bottle', price: 19 }, { name: 'Bottle', price: 19 }]);
});
