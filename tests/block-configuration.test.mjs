import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_BLOCKS, buildRenderContext, createBlockNode, getBlockDefinition, renderBlock, blockToHtml, documentToHtml, createEmailDocument, resolveEmailBody } from '../dist/index.js';

test('内置区块按各自能力声明分组，所有配置恰好出现一次', () => {
  const sections = {
    heading: ['Spacing', 'Block appearance'],
    text: ['Spacing', 'Block appearance'],
    button: ['Link', 'Button', 'Spacing', 'Block appearance'],
    image: ['Image', 'Size & position', 'Image appearance', 'Spacing', 'Block appearance'],
    divider: ['Line', 'Spacing', 'Block appearance'],
    spacer: ['Spacer'],
    html: ['HTML', 'Spacing', 'Block appearance'],
  };
  for (const builtin of DEFAULT_BLOCKS) {
    const definition = getBlockDefinition(builtin.type);
    assert.equal(definition.exactStyleFields, true);
    assert.deepEqual(definition.inspectorSections.map((section) => section.title), sections[builtin.type]);
    const ids = definition.inspectorSections.flatMap((section) => [...(section.styleIds ?? []), ...(section.advancedStyleIds ?? [])]);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual([...ids].sort(), definition.styleFields.map((field) => field.id).sort());
    const names = definition.inspectorSections.flatMap((section) => section.fieldNames ?? []);
    assert.deepEqual([...names].sort(), (definition.fields ?? []).map((field) => field.name).sort());
    assert.equal(ids.includes('dimension.height'), false);
    assert.equal(definition.styleFields.some((field) => field.group === 'typography'), false);
  }
  assert.deepEqual(getBlockDefinition('spacer').styleFields.map((field) => field.id), ['decorations.backgroundColor']);
  assert.equal(getBlockDefinition('divider').styleFields.some((field) => field.id.startsWith('decorations.border')), false);
  for (const type of ['heading', 'text', 'button']) assert.equal(getBlockDefinition(type).inlineEditProfile, type);
});

test('按钮只使用 html，富文本仅导出基础行内格式和一个外层链接', () => {
  const block = createBlockNode('button');
  assert.equal('label' in block.fields, false);
  assert.match(block.fields.html, /Buy now/);
  block.fields.label = 'ignored label';
  block.fields.href = 'https://example.com/buy';
  block.fields.html = '<p><strong>Buy</strong> <span style="font-size:24px;color:#123456">now &amp; save</span></p><ul><li><a href="https://nested.example">More</a></li></ul>';
  const html = renderBlock(block);
  assert.match(html, /<strong>Buy<\/strong>/);
  assert.match(html, /<span style="font-size:24px;color:#123456">now &amp; save<\/span>/);
  assert.equal((html.match(/<a\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<p\b|<ul\b|<li\b|nested\.example|&amp;amp;/);
  block.fields.html = '<p>Buy </p>';
  assert.match(renderBlock(block), />Buy <\/a>/);
  block.fields.html = '<p></p>';
  assert.doesNotMatch(renderBlock(block), /Buy now|ignored label/);
  delete block.fields.html;
  assert.doesNotMatch(renderBlock(block), /ignored label/);
});

test('HTML 保留源码内部样式，不再注入正文、链接或列表排版', () => {
  const block = createBlockNode('html');
  const source = '<p class="a">A</p><p style="margin:3px">B</p><ul><li>C</li></ul><a href="https://example.com">Link</a>';
  block.fields.html = source;
  block.style.typography = { fontSize: '21px', paragraphSpacing: '32px', listSpacing: '22px', listIndent: '50px', linkColor: '#123456' };
  const html = renderBlock(block, DEFAULT_BLOCKS, 'email', resolveEmailBody());
  assert.ok(html.includes(source));
  assert.doesNotMatch(html, /font-size:21px|margin:32px|margin:22px|padding-left:50px|color:#123456/);
});

test('按钮导出原样保留带引号、比较符、注释及空格的模板表达式', () => {
  const block = createBlockNode('button');
  const tokens = ['{{printf "%s" .customer_name}}', '{{- if eq .name "<VIP>" -}}', '{{ printf "}}" .name }}', '{{/* "comment }}" */}}', '{{  .store_name }}', '{{ printf `a > b` }}'];
  block.fields.html = `<p>${tokens.join(' &amp; ')} &lt;普通文本&gt;</p>`;
  const html = documentToHtml(createEmailDocument([block]));
  for (const token of tokens) assert.ok(html.includes(token), token);
  assert.ok(html.includes('&lt;普通文本&gt;'));
  assert.doesNotMatch(html, /REE_TEMPLATE_TOKEN_/);
  block.fields.html = '<p>{{printf "&lt;VIP&gt; &amp; &amp;quot;" .customer_name}}</p>';
  assert.ok(documentToHtml(createEmailDocument([block])).includes('{{printf "<VIP> & &quot;" .customer_name}}'));
  block.fields.html = '<p>{{printf &quot;}}&quot; .customer_name}}</p>';
  assert.ok(documentToHtml(createEmailDocument([block])).includes('{{printf "}}" .customer_name}}'));
});

test('正文行内列表与链接格式覆盖内部基础排版，邮件输出保留模板', () => {
  const block = createBlockNode('text');
  block.fields.html = '<ul style="margin:12px 0;padding-left:36px"><li><p><a href="https://example.com" style="color:#ff0000;text-decoration:none">{{.name}}</a></p></li></ul>';
  const doc = createEmailDocument([block]);
  const html = documentToHtml(doc);
  assert.match(html, /margin:12px 0;padding-left:36px/);
  assert.match(html, /color:#ff0000;text-decoration:none/);
  assert.match(html, /\{\{\.name\}\}/);
  assert.doesNotMatch(html, /ProseMirror|contenteditable|ree-rte/);
});

test('所有内置区块的画布上下文与邮件输出都忽略未声明的旧样式', () => {
  for (const definition of DEFAULT_BLOCKS) {
    const block = createBlockNode(definition.type);
    block.fields.html = '<p>Content</p>';
    block.style = {
      ...block.style,
      dimension: { ...block.style?.dimension, height: '321px' },
      typography: { fontSize: '37px', color: '#fedcba', paragraphSpacing: '33px', linkColor: '#abcdef' },
      element: { ...block.style?.element, fontSize: '39px', color: '#123abc' },
    };
    const context = buildRenderContext(block, 'canvas');
    assert.equal(context.style.typography, undefined);
    assert.equal(context.style.dimension?.height, undefined);
    assert.equal(context.style.element?.fontSize, undefined);
    assert.equal(context.style.element?.color, undefined);
    for (const mode of ['canvas', 'email']) {
      assert.doesNotMatch(blockToHtml(block, DEFAULT_BLOCKS, mode), /321px|37px|39px|#fedcba|#123abc/);
    }
    assert.equal(block.style.typography.fontSize, '37px');
  }
});

test('自定义区块仅渲染启用的样式，默认对象独立，旧文档版本被拒绝', () => {
  const definition = {
    type: 'card', title: 'Card', exactStyleFields: true,
    styleFields: [{ id: 'dimension.height' }, { id: 'typography.fontSize' }],
    defaultStyle: { dimension: { height: '72px', padding: '19px' }, typography: { fontSize: '28px', color: '#abcdef' } },
    render: ({ style }) => `<p style="font-size:${style.typography?.fontSize}">Card</p>`,
  };
  const first = createBlockNode('card', [definition]);
  const second = createBlockNode('card', [definition]);
  assert.deepEqual(first.style, { dimension: { height: '72px' }, typography: { fontSize: '28px' } });
  first.style.dimension.height = '80px';
  assert.equal(second.style.dimension.height, '72px');
  assert.match(blockToHtml(second, [definition]), /height="72"/);
  const doc = createEmailDocument([second]);
  assert.equal(doc.version, 3);
  for (const version of [1, 2]) assert.throws(() => documentToHtml({ ...doc, version }, [definition]), /Unsupported email document version/);
});


test('按钮和图片的链接默认留空，空白链接在画布、邮件及预览中不可跳转', () => {
  for (const type of ['button', 'image']) {
    const block = createBlockNode(type);
    const key = type === 'button' ? 'href' : 'link';
    assert.equal(block.fields[key], '');
    for (const value of [undefined, '', '   ']) {
      block.fields[key] = value;
      for (const mode of ['canvas', 'email']) {
        const html = renderBlock(block, DEFAULT_BLOCKS, mode);
        assert.doesNotMatch(html, /<a\b|href=/);
        assert.match(html, type === 'button' ? /Buy now/ : /<img\b/);
      }
      assert.doesNotMatch(documentToHtml(createEmailDocument([block]), DEFAULT_BLOCKS, { resolveHtmlTemplates: true }), /<a\b|href=/);
    }
    block.fields[key] = 'https://example.com/?a=1&b=2';
    assert.match(renderBlock(block), /href="https:\/\/example\.com\/\?a=1&amp;b=2"/);
  }
});

test('低频边框颜色默认为透明，显式颜色仍正常导出', () => {
  assert.equal(resolveEmailBody().borderColor, 'transparent');
  for (const type of ['button', 'image', 'text']) {
    const definition = getBlockDefinition(type);
    assert.equal(definition.styleFields.find((field) => field.id === 'decorations.borderColor').defaultValue, 'transparent');
    const block = createBlockNode(type);
    if (type !== 'text') {
      assert.equal(definition.styleFields.find((field) => field.id === 'element.borderColor').defaultValue, 'transparent');
      assert.match(renderBlock(block), /border-color:transparent/);
      block.style.element = { ...block.style.element, borderColor: '#123456' };
      assert.match(renderBlock(block), /border-color:#123456/);
    }
  }
});
