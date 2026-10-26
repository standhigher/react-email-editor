import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createEmailDocument, createBlockNode, DEFAULT_BLOCKS, documentToHtml, renderBlock, resolveEmailGlobal, blockToHtml } from '../dist/index.js';

test('新文档宽度默认 600，所有留白都允许清零', () => {
  const doc = createEmailDocument([createBlockNode('text'), createBlockNode('text')]);
  assert.equal(doc.global.contentWidth, 600);
  doc.global = resolveEmailGlobal({ ...doc.global, contentPadding: '0', outerPadding: '0', blockGap: '0', paragraphSpacing: '0', listSpacing: '0', listIndent: '0' });
  for (const key of ['contentPadding', 'outerPadding', 'blockGap', 'paragraphSpacing', 'listSpacing', 'listIndent']) assert.equal(doc.global[key], '0px');
  const html = documentToHtml(doc);
  assert.match(html, /max-width:600px/);
  assert.match(html, /width="600"/);
  assert.match(html, /align="center"/);
  assert.doesNotMatch(html, /padding:24px|height:16px/);
  assert.equal((html.match(/(?<![\w-])height:0px/g) ?? []).length, 1);
  assert.match(html, /height="0"/);
});

test('全部内置区块拥有独立容器样式和四边间距', () => {
  for (const definition of DEFAULT_BLOCKS) {
    const ids = definition.styleFields.map(field => field.id);
    for (const id of ['dimension.padding', 'dimension.margin', 'decorations.backgroundColor', 'decorations.borderWidth', 'decorations.borderStyle', 'decorations.borderColor', 'decorations.borderRadius']) assert.ok(ids.includes(id), `${definition.type}: ${id}`);
    const block = createBlockNode(definition.type);
    block.style = { ...block.style, dimension: { padding: '1px 2px 3px 4px', margin: '5px 6px 7px 8px' }, decorations: { backgroundColor: '#123456', borderWidth: '2px', borderStyle: 'dashed', borderRadius: '12px' } };
    const html = blockToHtml(block);
    assert.match(html, /padding:1px 2px 3px 4px/);
    assert.match(html, /padding:5px 6px 7px 8px/);
    assert.match(html, /background-color:#123456/);
    assert.match(html, /border-style:dashed/);
    assert.match(html, /border-radius:12px/);
    assert.doesNotMatch(html, /width="600"/);
  }
});

test('Text 继承全局排版，覆盖与显式富文本样式保持优先级', () => {
  const block = createBlockNode('text');
  block.fields.html = '<p style="text-align:right">A <a href="https://example.com">link</a></p><ul><li><p>B</p></li></ul>';
  const global = resolveEmailGlobal({ defaultFontSize: '22px', defaultLineHeight: '1.8', textAlign: 'center', paragraphSpacing: '0px', listSpacing: '12px', listIndent: '28px', linkColor: '#123456', linkDecoration: 'none' });
  const html = renderBlock(block, DEFAULT_BLOCKS, 'email', global);
  for (const css of ['font-size:22px', 'line-height:1.8', 'text-align:center', 'text-align:right', 'margin:0;text-align:right', 'margin:12px 0;padding-left:28px', 'color:#123456;text-decoration:none', '<p style="margin:0;">B</p>']) assert.ok(html.includes(css), css);
  assert.doesNotMatch(html, /margin:0 0 0px/);
  block.fields.html = '<p>A</p><p>B</p>';
  block.style.typography = { paragraphSpacing: '8px' };
  assert.match(renderBlock(block, DEFAULT_BLOCKS, 'email', global), /<p style="margin:0 0 8px;">A<\/p><p style="margin:0;">B<\/p>/);
  block.style.typography = { fontSize: '30px', paragraphSpacing: '5px' };
  assert.match(renderBlock(block, DEFAULT_BLOCKS, 'email', global), /font-size:30px/);
});

test('按钮、图片、分割线的元素样式与容器样式分离', () => {
  const button = createBlockNode('button');
  button.style.decorations = { backgroundColor: '#abcdef', borderRadius: '20px' };
  button.style.element = { ...button.style.element, width: '100%', padding: '0px', backgroundColor: '#000000', borderRadius: '0px' };
  const html = blockToHtml(button);
  const anchor = html.match(/<a\b[^>]*>/)[0];
  assert.match(html, /background-color:#abcdef/);
  assert.match(html, /background-color:#000000/);
  assert.match(html, /padding:0px/);
  assert.match(anchor, /display:block/);
  assert.match(anchor, /text-align:center/);
  assert.doesNotMatch(anchor, /background-color|padding:|border-radius|text-align:left|#abcdef/);
  const fresh = createBlockNode('button');
  delete fresh.style.element.backgroundColor;
  assert.match(renderBlock(fresh), /background-color:#005bd3/);
  const image = createBlockNode('image');
  image.style.element = { align: 'right', width: '120px', height: '80px', borderWidth: '3px' };
  const imageHtml = renderBlock(image);
  assert.match(imageHtml, /align="right"/);
  assert.match(imageHtml, /width="120"/);
  assert.match(imageHtml, /height="80"/);
  assert.match(imageHtml, /border="0"/);
  assert.match(imageHtml, /display:block/);
  assert.doesNotMatch(imageHtml, /object-fit/);
  image.style.element = { align: 'center', width: 'auto' };
  const autoImage = renderBlock(image);
  assert.match(autoImage, /align="center"/);
  assert.doesNotMatch(autoImage, /display:block/);
  const divider = createBlockNode('divider');
  divider.style.element = { align: 'right', width: '50%', borderWidth: '4px', borderStyle: 'dotted', borderColor: '#111111' };
  const dividerHtml = renderBlock(divider);
  assert.match(dividerHtml, /align="right"/);
  assert.match(dividerHtml, /width="50%"/);
  assert.match(dividerHtml, /border-top:4px dotted #111111/);
  assert.match(dividerHtml, /&nbsp;/);
  assert.match(renderBlock(createBlockNode('spacer')), /height="16"[\s\S]*&nbsp;/);
});

test('HTML 模板预览解析数据，导出保留变量且没有嵌套文档', () => {
  const block = createBlockNode('html');
  block.fields.html = '<!DOCTYPE html><html><head><style>.title{color:red}</style></head><body style="padding:0"><p class="title">{{.name}}</p></body></html>';
  block.defaultData = { name: '测试客户' };
  const doc = createEmailDocument([block]);
  assert.match(documentToHtml(doc), /\{\{\.name\}\}/);
  const preview = documentToHtml(doc, DEFAULT_BLOCKS, { resolveHtmlTemplates: true });
  assert.match(preview, /测试客户/);
  assert.match(preview, /<head>[\s\S]*<style>\.title\{color:red\}<\/style>[\s\S]*<\/head>/);
  assert.doesNotMatch(preview, /:where\(|<!--ree-head-->/);
  assert.match(preview, /<p class="title" style="margin:0;">测试客户<\/p>/);
  assert.equal((preview.match(/<body\b/g) ?? []).length, 1);
  assert.equal((preview.match(/<html\b/g) ?? []).length, 1);
});

test('自定义区块的邮件模板在预览时展开，导出保留变量', () => {
  const products = {
    type: 'products',
    title: 'Products',
    defaultData: { has_products: true, products: [{ title: 'Cup' }] },
    render: () => '{{if .has_products}}{{range .products}}<p>{{.title}}</p>{{end}}{{end}}',
  };
  const block = createBlockNode('products', [products]);
  const doc = createEmailDocument([block]);
  assert.match(documentToHtml(doc, [products]), /\{\{\.title\}\}/);
  const preview = documentToHtml(doc, [products], { resolveHtmlTemplates: true });
  assert.match(preview, /<p>Cup<\/p>/);
  assert.doesNotMatch(preview, /\{\{\.title\}\}/);
});

test('Heading 默认加粗，画布段落继承区块字重而不吃宿主重置', async () => {
  const block = createBlockNode('heading');
  assert.match(renderBlock(block), /font-weight:bold/);
  assert.match(renderBlock(block), /font-size:26px/);
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.ree-block-content :is\(p, h1, h2, h3, h4, h5, h6, li\) \{[^}]*font-weight: inherit/);
  assert.doesNotMatch(css, /\.ree-block-content :is\([^)]*\b(?:strong|em|a|span)\b/);
});

test('构建产物包含展开后的画布、滑动条和配置控件 CSS', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /@import/);
  for (const selector of ['.ree-email-surface', '.ree-spacing-grid', '.ree-inspector-tab', '.ree-range::-webkit-slider-runnable-track']) assert.ok(css.includes(selector));
  assert.match(css, /#303030 var\(--ree-range-progress\), #e3e3e5/);
});
