import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { BLOCK_TYPES, BORDER_STYLES, createDecorationFields, createDimensionFields, createEmailDocument, createBlockNode, createTypographyFields, DEFAULT_BLOCKS, DOCUMENT_VERSION, documentToHtml, FONT_FAMILIES, FONT_WEIGHTS, getBlockDefinition, HORIZONTAL_ALIGNS, LINK_DECORATIONS, renderBlock, resolveBlockStyleFields, resolveEmailBody, blockToHtml, TEXT_ALIGNS } from '../dist/index.js';

test('内置区块类型和样式取值可从包入口引用', () => {
  assert.deepEqual(DEFAULT_BLOCKS.map((block) => block.type), Object.values(BLOCK_TYPES));
  assert.equal(createEmailDocument().version, DOCUMENT_VERSION);
  assert.equal(createBlockNode(BLOCK_TYPES.heading).type, BLOCK_TYPES.heading);
  assert.deepEqual(Object.values(TEXT_ALIGNS), ['left', 'center', 'right', 'justify']);
  assert.deepEqual(Object.values(HORIZONTAL_ALIGNS), ['left', 'center', 'right']);
  assert.deepEqual(Object.values(FONT_WEIGHTS), ['normal', 'bold']);
  assert.deepEqual(Object.values(BORDER_STYLES), ['none', 'solid', 'dashed', 'dotted']);
  assert.deepEqual(Object.values(LINK_DECORATIONS), ['underline', 'none']);
  assert.equal(Object.isFrozen(FONT_FAMILIES), true);
  for (const value of ['Arial, Helvetica, sans-serif', 'Georgia, serif', "'Courier New', Courier, monospace"]) {
    assert.equal(FONT_FAMILIES.some((font) => font.value === value), true, value);
  }
});

test('新文档宽度默认 600，所有留白都允许清零', () => {
  const doc = createEmailDocument([createBlockNode('text'), createBlockNode('text')]);
  assert.equal(doc.body.contentWidth, 600);
  assert.equal(doc.body.contentPadding, '0px');
  assert.equal(doc.body.blockGap, '4px');
  doc.body = resolveEmailBody({ ...doc.body, contentPadding: '0', blockGap: '0' });
  for (const key of ['contentPadding', 'blockGap']) assert.equal(doc.body[key], '0px');
  const html = documentToHtml(doc);
  assert.match(html, /max-width:600px/);
  assert.match(html, /width="600"/);
  assert.match(html, /align="center"/);
  assert.doesNotMatch(html, /padding:24px|height:16px/);
  assert.equal((html.match(/(?<![\w-])height:0px/g) ?? []).length, 1);
  assert.match(html, /height="0"/);
});

test('容器只渲染区块支持的样式，Spacer 和 Divider 不读取隐藏的边框或间距', () => {
  for (const definition of DEFAULT_BLOCKS) {
    const block = createBlockNode(definition.type);
    block.style = { ...block.style, dimension: { padding: '1px 2px 3px 4px', margin: '5px 6px 7px 8px' }, decorations: { backgroundColor: '#123456', borderWidth: '2px', borderStyle: 'dashed', borderRadius: '12px' } };
    const html = blockToHtml(block);
    if (definition.type === 'spacer') {
      assert.doesNotMatch(html, /padding:1px 2px 3px 4px|padding:5px 6px 7px 8px/);
    } else {
      assert.match(html, /padding:1px 2px 3px 4px/);
      assert.match(html, /padding:5px 6px 7px 8px/);
    }
    assert.match(html, /background-color:#123456/);
    if (['spacer', 'divider'].includes(definition.type)) {
      assert.doesNotMatch(html, /border-style:dashed|border-radius:12px/);
    } else {
      assert.match(html, /border-style:dashed/);
      assert.match(html, /border-radius:12px/);
    }
    assert.doesNotMatch(html, /valign="top"/);
    assert.doesNotMatch(html, /width="600"/);
  }
});

test('Text 使用默认主体排版，显式富文本样式优先，布局配置不影响文字', () => {
  const block = createBlockNode('text');
  block.fields.html = '<p style="text-align:right">A <a href="https://example.com">link</a></p><ul><li><p>B</p></li></ul>';
  const body = resolveEmailBody({ contentWidth: 720, backgroundColor: '#eeeeee' });
  const html = renderBlock(block, DEFAULT_BLOCKS, 'email', body);
  for (const css of ['font-size:16px', 'line-height:1.5', 'text-align:left', 'text-align:right', 'margin:0;text-align:right', 'margin:4px 0;padding-left:22px', 'color:#005bd3;text-decoration:underline', '<p style="margin:0;">B</p>']) assert.ok(html.includes(css), css);
  block.fields.html = '<p>A</p><p>B</p>';
  block.style.typography = { fontSize: '30px', paragraphSpacing: '5px' };
  const updated = renderBlock(block, DEFAULT_BLOCKS, 'email', body);
  assert.match(updated, /<p style="margin:0;">A<\/p><p style="margin:6px 0 0 0;">B<\/p>/);
  assert.doesNotMatch(updated, /font-size:30px|margin:5px/);
  assert.equal(updated, renderBlock(block));
});

test('按钮、图片、分割线的元素样式与容器样式分离', () => {
  const button = createBlockNode('button');
  button.fields.href = 'https://example.com';
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
  assert.match(renderBlock(fresh), /background-color:#000000/);
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
  assert.match(preview, /<p class="title">测试客户<\/p>/);
  assert.equal((preview.match(/<body\b/g) ?? []).length, 1);
  assert.equal((preview.match(/<html\b/g) ?? []).length, 1);
});

test('自定义区块按容器槽位合并样式，并返回独立副本', () => {
  const customPadding = { id: 'dimension.padding', group: 'dimension', label: 'Inner padding', control: 'text', defaultValue: '12px' };
  const customBackground = { id: 'decorations.backgroundColor', group: 'decorations', label: 'Card fill', control: 'color', defaultValue: '#eeeeee' };
  const card = { id: 'element.backgroundColor', group: 'decorations', label: 'Card', control: 'color', defaultValue: '#ffffff' };
  const containerIds = ['dimension.padding', 'dimension.margin', 'dimension.height', 'decorations.backgroundColor', 'decorations.borderWidth', 'decorations.borderStyle', 'decorations.borderColor', 'decorations.borderRadius'];
  const resolved = resolveBlockStyleFields([customBackground, card, customPadding]);
  assert.deepEqual(resolved.map((field) => field.id), [...containerIds, card.id]);
  assert.equal(resolved.find((field) => field.id === 'dimension.padding').label, 'Inner padding');
  assert.equal(resolved.find((field) => field.id === 'decorations.backgroundColor').label, 'Card fill');
  assert.notEqual(resolved.find((field) => field.id === 'dimension.padding'), customPadding);
  customPadding.label = 'Changed';
  assert.equal(resolved.find((field) => field.id === 'dimension.padding').label, 'Inner padding');
  const again = resolveBlockStyleFields(resolved);
  assert.deepEqual(again.map((field) => field.id), resolved.map((field) => field.id));
  assert.equal(again.find((field) => field.id === 'decorations.backgroundColor').label, 'Card fill');
  assert.deepEqual(resolveBlockStyleFields([card], true).map((field) => field.id), [card.id]);
  assert.notEqual(resolveBlockStyleFields([card], true)[0], card);
  assert.deepEqual(resolveBlockStyleFields(undefined, true), []);
  assert.deepEqual(resolveBlockStyleFields().map((field) => field.id), containerIds);
  const text = DEFAULT_BLOCKS.find((definition) => definition.type === 'text');
  assert.deepEqual(resolveBlockStyleFields(text.styleFields, text.exactStyleFields).map((field) => field.id), text.styleFields.map((field) => field.id));
  const cardBlock = {
    type: 'card',
    title: 'Card',
    styleFields: [customBackground, card],
    render: () => '',
  };
  const lookedUp = getBlockDefinition('card', [cardBlock]);
  assert.equal(lookedUp.styleFields.find((field) => field.id === 'decorations.backgroundColor').label, 'Card fill');
  assert.deepEqual(lookedUp.styleFields.map((field) => field.id), [...containerIds, card.id]);
  assert.equal(cardBlock.styleFields.length, 2);
  assert.equal(createDimensionFields().padding.id, 'dimension.padding');
  assert.equal(createDimensionFields().margin.label, 'Outer spacing');
  const padding = createDimensionFields({ padding: { id: 'element.padding', label: 'Card padding', defaultValue: '16px' } }).padding;
  assert.equal(padding.control, 'spacing');
  assert.equal(padding.defaultValue, '16px');
  const background = createDecorationFields({ backgroundColor: { id: 'element.backgroundColor', label: 'Card', defaultValue: '#ffffff' } }).backgroundColor;
  assert.deepEqual(background, { id: 'element.backgroundColor', group: 'decorations', label: 'Card', control: 'color', defaultValue: '#ffffff' });
  const border = createDecorationFields().borderStyle;
  assert.deepEqual(border.options.map((option) => option.value), Object.values(BORDER_STYLES));
  assert.deepEqual(border.options.map((option) => option.label), ['None', 'Solid', 'Dashed', 'Dotted']);
  border.options.push({ label: 'Double', value: 'double' });
  assert.equal(createDecorationFields().borderStyle.options.some((option) => option.value === 'double'), false);
  const font = createTypographyFields({ fontSize: { id: 'element.fontSize' } }).fontSize;
  assert.equal(createTypographyFields().fontSize.id, 'typography.fontSize');
  assert.equal(font.unit, 'px');
  assert.equal(font.min, 8);
  assert.equal(font.max, 72);
  const fontOptions = createTypographyFields().fontFamily.options;
  fontOptions.push({ label: 'Extra', value: 'Extra, sans-serif' });
  assert.equal(FONT_FAMILIES.some((item) => item.value === 'Extra, sans-serif'), false);
  const button = DEFAULT_BLOCKS.find((definition) => definition.type === 'button');
  const buttonPadding = button.styleFields.find((field) => field.id === 'element.padding');
  assert.equal(buttonPadding.label, 'Button padding');
  assert.equal(buttonPadding.defaultValue, '12px 32px');
  assert.equal(button.styleFields.find((field) => field.id === 'element.borderColor').label, 'Outline');
});

test('圆角可分四角，内置区块忽略容器高度，段落支持间距和行高', () => {
  assert.equal(createDecorationFields().borderRadius.control, 'corners');
  assert.equal(createDimensionFields().height.id, 'dimension.height');
  assert.equal(createDimensionFields().height.max, 480);
  const block = createBlockNode('text');
  block.style = { dimension: { height: '216px' }, decorations: { borderRadius: '8px 8px 0 0' } };
  const html = blockToHtml(block);
  assert.doesNotMatch(html, /height="216"|valign="top"|height:216px|vertical-align:top/);
  assert.match(html, /border-top-left-radius:8px/);
  assert.match(html, /border-top-right-radius:8px/);
  assert.match(html, /border-bottom-right-radius:0px/);
  assert.match(html, /border-bottom-left-radius:0px/);
  assert.doesNotMatch(html, /border-radius:/);
  block.style.dimension = { height: '0px' };
  block.style.decorations = { borderRadius: '8px 8px 8px 8px' };
  const uniform = blockToHtml(block);
  assert.doesNotMatch(uniform, /valign="top"|height="0"|box-sizing:border-box/);
  assert.match(uniform, /border-radius:8px/);
  assert.doesNotMatch(uniform, /border-top-left-radius/);
  const body = resolveEmailBody();
  block.fields.html = '<p style="margin:10px">A</p><p data-spacing="0">B</p><p data-spacing="16px" data-line-height="1.5" style="line-height:2;--ree-paragraph-gap: 16px">C</p>';
  block.style = { typography: { paragraphSpacing: '8px' } };
  const text = renderBlock(block, DEFAULT_BLOCKS, 'email', body);
  assert.match(text, /<p style="margin:0;margin:10px">A<\/p>/);
  assert.match(text, /<p style="margin:0;">B<\/p>/);
  assert.match(text, /<p style="margin:16px 0 0 0;line-height:1.5;">C<\/p>/);
  assert.doesNotMatch(text, /data-spacing|data-line-height|--ree-paragraph-gap/);
  block.fields.html = '<p data-spacing="12px" style="margin:10px">A</p><ul><li><p data-spacing="16px" style="margin:4px">B</p></li></ul><p style="margin:8px">C</p>';
  const placed = renderBlock(block, DEFAULT_BLOCKS, 'email', body);
  assert.match(placed, /<p style="margin:12px 0 0 0;">A<\/p>/);
  assert.match(placed, /<p style="margin:0;margin:4px">B<\/p>/);
  assert.match(placed, /<p style="margin:0;margin:8px">C<\/p>/);
  assert.doesNotMatch(placed, /margin:16px|data-spacing/);
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

test('Heading 默认格式存入富文本，画布段落继承内部基础排版而保留行内粗体', async () => {
  const block = createBlockNode('heading');
  assert.match(renderBlock(block), /<strong>Heading<\/strong>/);
  assert.match(renderBlock(block), /font-size:26px/);
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.ree-block-content :is\(p, h1, h2, h3, h4, h5, h6, li\) \{[^}]*font-weight: inherit/);
  assert.doesNotMatch(css, /\.ree-block-content :is\([^)]*\b(?:strong|em|a|span)\b/);
});

test('构建产物包含展开后的画布、滑动条和配置控件 CSS', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /@import/);
  for (const selector of ['.ree-email-surface', '.ree-spacing-grid', '.ree-inspector-tab', '.ree-range::-webkit-slider-runnable-track']) assert.ok(css.includes(selector));
  assert.match(css, /\.ree-rte \.ProseMirror p \{[^}]*--ree-paragraph-gap/);
  assert.match(css, /\.ree-rte \.ProseMirror p \+ p \{[^}]*--ree-paragraph-gap/);
  assert.doesNotMatch(css, /p:has\(\+ p\)/);
  assert.match(css, /#303030 var\(--ree-range-progress\), #e3e3e5/);
});

test('Text 和 Heading 只从富文本内容读取文字格式', () => {
  for (const type of ['text', 'heading']) {
    const definition = getBlockDefinition(type);
    const typographyIds = definition.styleFields.filter((field) => field.group === 'typography').map((field) => field.id);
    assert.deepEqual(typographyIds, []);
    const block = createBlockNode(type);
    block.fields.html = '<p>Legacy</p>';
    block.style.typography = { fontFamily: 'Georgia, serif', fontSize: '10px', fontWeight: 'bold', color: '#123456', textAlign: 'right', lineHeight: '1.8' };
    const html = renderBlock(block, DEFAULT_BLOCKS, 'email', resolveEmailBody());
    for (const css of ['font-family:Georgia, serif', 'font-size:10px', 'font-weight:bold', 'color:#123456', 'text-align:right', 'line-height:1.8']) assert.equal(html.includes(css), false, css);
  }
});
