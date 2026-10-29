import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as editor from '../dist/index.js';

const { defineBlock, createBlockNode, createEmailDocument, resolveEmailBody, documentToHtml, DEFAULT_EMAIL_BODY, DEFAULT_BLOCKS, buildRenderContext } = editor;

test('Body 文档只存主体配置，公开入口不再提供 Global API', () => {
  const doc = createEmailDocument();
  assert.equal(doc.version, 4);
  assert.deepEqual(Object.keys(doc).sort(), ['blocks', 'body', 'version']);
  assert.deepEqual(Object.keys(doc.body).sort(), [
    'textColor', 'backgroundColor', 'contentWidth', 'fontFamily', 'fontWeight', 'linkColor', 'linkDecoration',
    'contentPadding', 'blockGap', 'borderWidth', 'borderStyle', 'borderColor',
  ].sort());
  assert.deepEqual(doc.body, DEFAULT_EMAIL_BODY);
  assert.equal('outerPadding' in resolveEmailBody({ outerPadding: '24px' }), false);
  assert.equal('resolveEmailGlobal' in editor, false);
  assert.equal('DEFAULT_EMAIL_GLOBAL' in editor, false);
  doc.body.contentWidth = 720;
  assert.equal(createEmailDocument().body.contentWidth, 600);
  assert.equal(DEFAULT_EMAIL_BODY.contentWidth, 600);
});

test('Body 归一化主体尺寸、间距、颜色和基础排版', () => {
  const body = resolveEmailBody({ contentWidth: 640.4, contentPadding: '12 24', blockGap: '8', borderWidth: '2', fontFamily: 'Georgia, serif', fontWeight: 'bold', linkColor: '#123456', linkDecoration: 'none' });
  assert.equal(body.contentWidth, 640);
  assert.equal(body.contentPadding, '12px 24px');
  assert.equal(body.blockGap, '8px');
  assert.equal(body.borderWidth, '2px');
  assert.equal(body.fontFamily, 'Georgia, serif');
  assert.equal(body.fontWeight, 'bold');
  assert.equal(body.linkColor, '#123456');
  assert.equal(body.linkDecoration, 'none');
  const invalid = resolveEmailBody({ contentWidth: Number.NaN, backgroundColor: '', fontWeight: 'invalid', linkDecoration: 'invalid' });
  assert.equal(invalid.contentWidth, DEFAULT_EMAIL_BODY.contentWidth);
  assert.equal(invalid.backgroundColor, DEFAULT_EMAIL_BODY.backgroundColor);
  assert.equal(invalid.fontWeight, DEFAULT_EMAIL_BODY.fontWeight);
  assert.equal(invalid.linkDecoration, DEFAULT_EMAIL_BODY.linkDecoration);
});

test('Body 未指定或清空字体时保留默认状态，画布、邮件和预览回退到默认字体', () => {
  assert.equal(createEmailDocument().body.fontFamily, '');
  for (const fontFamily of [undefined, '', '   ']) {
    const body = resolveEmailBody({ fontFamily });
    assert.equal(body.fontFamily, '');
    const block = createBlockNode('text');
    block.controls.html = '<p>Default <span style="font-family:Georgia, serif">Explicit</span></p>';
    const doc = { ...createEmailDocument([block]), body };
    const outputs = [
      editor.blockToHtml(block, DEFAULT_BLOCKS, 'canvas', { body }),
      documentToHtml(doc),
      documentToHtml(doc, DEFAULT_BLOCKS, { resolveHtmlTemplates: true }),
    ];
    for (const html of outputs) {
      assert.ok(html.includes('font-family:Arial, Helvetica, sans-serif'));
      assert.ok(html.includes('font-family:Georgia, serif'));
    }
    assert.equal(doc.body.fontFamily, '');
  }
});

test('画布和邮件主体使用一致的相对尺寸与基础排版', (t) => {
  const reportError = console.error.bind(console);
  // 这里只比较首次渲染标记；React 18 的服务端 layout effect 提示与此检查无关。
  t.mock.method(console, 'error', (message, ...args) => {
    if (String(message).startsWith('Warning: useLayoutEffect does nothing on the server')) return;
    reportError(message, ...args);
  });
  const doc = createEmailDocument([createBlockNode('text')]);
  doc.body = resolveEmailBody({ contentPadding: '1em', borderWidth: '0.25em', fontFamily: 'Georgia, serif', fontWeight: 'bold', textColor: '#123456' });
  function Harness() {
    const instance = editor.useEmailEditor({ initialDocument: doc });
    return createElement(editor.EmailEditor, { editor: instance });
  }
  const canvas = renderToStaticMarkup(createElement(Harness));
  const canvasStyle = canvas.match(/class="ree-email-surface" style="([^"]*)"/)?.[1];
  assert.ok(canvasStyle);
  for (const resolveHtmlTemplates of [false, true]) {
    const html = documentToHtml(doc, DEFAULT_BLOCKS, { resolveHtmlTemplates });
    const emailStyle = html.match(/<td style="box-sizing:border-box;([^"]*)"/)?.[1];
    assert.ok(emailStyle);
    for (const css of ['font-size:16px', 'font-family:Georgia, serif', 'font-weight:bold', 'color:#123456', 'line-height:1.5', 'padding:1em', 'border-width:0.25em']) {
      assert.ok(canvasStyle.includes(css), `canvas: ${css}`);
      assert.ok(emailStyle.includes(css), `email: ${css}`);
    }
  }
});

test('Body 布局和外观进入邮件与预览，富文本显式格式保持优先', () => {
  const text = createBlockNode('text');
  text.controls.html = '<p style="text-align:right"><span style="font-size:24px;color:#123456">{{.name}}</span></p>';
  const doc = createEmailDocument([text, createBlockNode('text')]);
  doc.body = resolveEmailBody({ backgroundColor: '#eeeeee', contentWidth: 640, contentPadding: '8px', blockGap: '10px', borderWidth: '2px', borderColor: '#abcdef' });
  const before = structuredClone(doc);
  for (const resolveHtmlTemplates of [false, true]) {
    const html = documentToHtml(doc, DEFAULT_BLOCKS, { resolveHtmlTemplates, templateData: { name: 'Alice' } });
    for (const css of ['background-color:#eeeeee', 'background-color:#ffffff', 'max-width:640px', 'padding:8px', 'height:10px', 'border-width:2px', 'border-color:#abcdef', 'text-align:right', 'font-size:24px;color:#123456', 'font-size:16px', 'line-height:1.5']) assert.ok(html.includes(css), css);
    assert.match(html, /align="center"/);
    assert.match(html, /<td align="center" style="padding:0;/);
    assert.equal((html.match(/padding:8px(?:;|")/g) ?? []).length, 1);
    assert.equal((html.match(/<body\b/g) ?? []).length, 1);
    assert.ok(html.includes(resolveHtmlTemplates ? 'Alice' : '{{.name}}'));
    assert.doesNotMatch(html, /ree-inspector|contenteditable|ProseMirror/);
  }
  assert.deepEqual(doc, before);
});

test('自定义区块通过 body 上下文读取主体设置', () => {
  const definition = defineBlock({ type: 'body-width', title: 'Body width', renderEmail: ({ body, mode }) => `<p>${mode}:${body.contentWidth}</p>` });
  const block = createBlockNode(definition.type, [definition]);
  const body = resolveEmailBody({ contentWidth: 680 });
  for (const mode of ['canvas', 'email']) {
    const context = buildRenderContext(block, mode, body, definition);
    assert.deepEqual(context.body, body);
    assert.equal('global' in context, false);
    assert.equal(definition.renderEmail(context), `<p>${mode}:680</p>`);
  }
  assert.match(editor.blockToHtml(block, [definition], 'email', { body }), /email:680/);
  const doc = { ...createEmailDocument([block]), body };
  assert.match(documentToHtml(doc, [definition]), /email:680/);
});

test('General 默认文字和链接格式用于画布、邮件和模板预览，单独设置的格式优先', () => {
  const body = resolveEmailBody({ textColor: '#123456', fontFamily: 'Georgia, serif', fontWeight: 'bold', linkColor: '#654321', linkDecoration: 'none' });
  for (const type of ['text', 'heading']) {
    const block = createBlockNode(type);
    block.controls.html = '<p>{{.name}} <a href="https://example.com">Default</a> <a href="https://example.com/custom" style="color:#abcdef;text-decoration:underline">Custom</a><span style="color:#fedcba;font-family:Verdana;font-weight:normal">Explicit</span></p>';
    for (const mode of ['canvas', 'email']) {
      const html = editor.blockToHtml(block, DEFAULT_BLOCKS, mode, { body });
      for (const css of ['color:#123456', 'font-family:Georgia, serif', 'font-weight:bold', 'color:#654321;text-decoration:none;', 'color:#abcdef;text-decoration:underline', 'color:#fedcba;font-family:Verdana;font-weight:normal']) assert.ok(html.includes(css), `${type}:${mode}:${css}`);
    }
    const doc = { ...createEmailDocument([block]), body };
    const preview = documentToHtml(doc, DEFAULT_BLOCKS, { resolveHtmlTemplates: true, templateData: { name: 'Alice' } });
    assert.ok(preview.includes('Alice'));
    assert.ok(preview.includes('color:#654321;text-decoration:none;'));
    doc.body = resolveEmailBody({ ...body, linkColor: '#987654', linkDecoration: 'underline' });
    const changed = documentToHtml(doc);
    assert.ok(changed.includes('color:#987654;text-decoration:underline;'));
    assert.ok(changed.includes('color:#abcdef;text-decoration:underline'));
  }
});

test('按钮继承主体字体和字重，保留自身文字颜色与链接外观；HTML 保留作者格式', () => {
  const body = resolveEmailBody({ textColor: '#123456', fontFamily: 'Georgia, serif', fontWeight: 'bold', linkColor: '#654321', linkDecoration: 'underline' });
  const button = createBlockNode('button');
  button.controls.href = 'https://example.com/buy';
  const raw = createBlockNode('html');
  raw.controls.html = '<p style="font-weight:normal;color:#abcdef">Author</p><a href="https://example.com" style="color:red">Link</a>';
  for (const mode of ['canvas', 'email']) {
    const html = editor.renderBlock(button, DEFAULT_BLOCKS, mode, body);
    assert.ok(html.includes('font-family:Georgia, serif'));
    assert.ok(html.includes('font-weight:bold'));
    assert.ok(html.includes('color:#ffffff'));
    assert.ok(html.includes('text-decoration:none;'));
    assert.doesNotMatch(html, /color:#654321|text-decoration:underline/);
    const authored = editor.renderBlock(raw, DEFAULT_BLOCKS, mode, body);
    assert.ok(authored.includes(raw.controls.html));
    assert.ok(authored.includes('font-family:Georgia, serif'));
  }
});
