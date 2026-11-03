import "./helpers/source-modules.mjs";
import { renderConfig } from "./helpers/render-config.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { act, create } from "react-test-renderer";
import { createDecorationControls, createEmailDocument, defineBlock, resolveEmailBody } from "../dist/index.js";

const { BodyControls } = await import("../src/inspector/BodyControls.tsx");
const { InspectorControls } = await import("../src/inspector/InspectorControls.tsx");
const { StyleControl } = await import("../src/inspector/StyleControl.tsx");
const { writeStyleValue } = await import("../src/utils/style.ts");

test("主体边框按宽度展开，收起与重新展开保留颜色和线型", (t) => {
  let body = resolveEmailBody({ borderColor: "#123456", borderStyle: "dashed" });
  let renderer;
  const render = () => createElement(BodyControls, {
    body, onChange: (patch) => { body = resolveEmailBody({ ...body, ...patch }); },
  });
  act(() => { renderer = create(render()); });
  t.after(() => act(() => renderer.unmount()));
  const controls = () => renderer.root.findAllByType(StyleControl);
  const find = (id) => controls().find((node) => node.props.config.id === id);
  const changeWidth = (value) => {
    act(() => find("borderWidth").props.onChange(value));
    act(() => renderer.update(render()));
  };
  assert.ok(find("borderWidth"));
  assert.equal(find("borderColor"), undefined);
  assert.equal(find("borderStyle"), undefined);
  for (const width of ["2px", "0px", "1px"]) {
    changeWidth(width);
    assert.equal(Boolean(find("borderColor")), width !== "0px");
    assert.equal(Boolean(find("borderStyle")), width !== "0px");
    assert.equal(body.borderColor, "#123456");
    assert.equal(body.borderStyle, "dashed");
    assert.equal(body.borderWidth, width);
  }
});

test("区块和元素边框独立展开，圆角保留，重置宽度按默认值显示", (t) => {
  const config = renderConfig();
  let block = config.createBlock("image");
  block.style.element.borderWidth = "1px";
  const definition = config.definitions.find((item) => item.type === "image");
  let renderer;
  const render = () => createElement(InspectorControls, {
    block, definition, body: resolveEmailBody(), variables: [],
    onCommitControl: () => {}, onCommitControls: () => {},
    onCommitStyle: (_id, id, value) => { block = { ...block, style: writeStyleValue(block.style, id, value) }; },
  });
  act(() => { renderer = create(render()); });
  t.after(() => act(() => renderer.unmount()));
  const find = (id) => renderer.root.findAllByType(StyleControl).find((node) => node.props.config.id === id);
  const change = (id, value) => {
    act(() => find(id).props.onChange(value));
    act(() => renderer.update(render()));
  };
  assert.equal(find("decorations.borderColor"), undefined);
  assert.ok(find("element.borderColor"));
  assert.equal(find("element.borderColor").props.value, "#000000");
  assert.ok(find("decorations.borderRadius"));
  assert.ok(find("element.borderRadius"));
  change("element.borderColor", "#123456");
  change("element.borderStyle", "dashed");
  change("element.borderWidth", "0px");
  assert.equal(find("element.borderColor"), undefined);
  assert.equal(find("element.borderStyle"), undefined);
  assert.ok(find("element.borderRadius"));
  change("decorations.borderWidth", "2px");
  assert.ok(find("decorations.borderColor"));
  assert.equal(find("element.borderColor"), undefined);
  change("element.borderWidth", find("element.borderWidth").props.resetTo);
  assert.equal(find("element.borderColor"), undefined);
  assert.equal(block.style.element.borderWidth, "0px");
  change("element.borderWidth", "1px");
  assert.equal(find("element.borderColor").props.value, "#123456");
  assert.equal(find("element.borderStyle").props.value, "dashed");
  assert.equal(block.style.element.borderWidth, "1px");
  assert.match(config.toHtml(createEmailDocument([block])), /border-width:1px;border-style:dashed;border-color:#123456/);
  change("decorations.borderWidth", find("decorations.borderWidth").props.resetTo);
  assert.equal(find("decorations.borderColor"), undefined);
  assert.ok(find("element.borderColor"));
  change("element.borderColor", find("element.borderColor").props.resetTo);
  assert.equal(block.style.element.borderColor, "#000000");
  assert.match(config.toHtml(createEmailDocument([block])), /border-width:1px;border-style:dashed;border-color:#000000/);
});

test("按钮移除元素边框控件，保留填充、圆角和区块容器边框", (t) => {
  const config = renderConfig();
  const block = config.createBlock("button");
  const definition = config.definitions.find((item) => item.type === "button");
  let renderer;
  act(() => { renderer = create(createElement(InspectorControls, {
    block, definition, body: resolveEmailBody(), variables: [],
    onCommitControl: () => {}, onCommitControls: () => {}, onCommitStyle: () => {},
  })); });
  t.after(() => act(() => renderer.unmount()));
  const ids = renderer.root.findAllByType(StyleControl).map((node) => node.props.config.id);
  for (const id of ["element.borderWidth", "element.borderStyle", "element.borderColor"]) {
    assert.equal(ids.includes(id), false, id);
  }
  for (const id of ["element.backgroundColor", "element.borderRadius", "decorations.borderWidth"]) {
    assert.ok(ids.includes(id), id);
  }
});

test("自定义区块的宽度跨检查器分组生效，未声明宽度的边框控件保持显示", (t) => {
  const decoration = createDecorationControls();
  const config = renderConfig({ plugins: [defineBlock({
    type: "border-test", title: "Border test", containerStyles: false,
    styleControls: [decoration.borderWidth, decoration.borderColor, decoration.borderStyle,
      { ...decoration.borderColor, id: "element.borderColor" }],
    inspectorSections: [
      { title: "Width", styleIds: ["decorations.borderWidth"] },
      { title: "Colors", styleIds: ["decorations.borderColor", "decorations.borderStyle", "element.borderColor"] },
    ],
    renderEmail: () => "<p>Test</p>",
  })] });
  const block = config.createBlock("border-test");
  const definition = config.definitions.find((item) => item.type === "border-test");
  let renderer;
  const render = () => createElement(InspectorControls, {
    block, definition, body: resolveEmailBody(), variables: [],
    onCommitControl: () => {}, onCommitControls: () => {}, onCommitStyle: () => {},
  });
  act(() => { renderer = create(render()); });
  t.after(() => act(() => renderer.unmount()));
  const ids = () => renderer.root.findAllByType(StyleControl).map((node) => node.props.config.id);
  assert.deepEqual(ids(), ["decorations.borderWidth", "element.borderColor"]);
  block.style.decorations.borderWidth = "0.25px";
  act(() => renderer.update(render()));
  assert.deepEqual(ids(), ["decorations.borderWidth", "decorations.borderColor", "element.borderColor", "decorations.borderStyle"]);
});
