import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";

const { SubjectBar } = await import("../src/shell/SubjectBar.tsx");

test("多个主题输入框的 label、计数和更新目标相互隔离", (t) => {
  const firstChanges = [];
  const secondChanges = [];
  const tree = createElement(Fragment, null,
    createElement(SubjectBar, { subject: "First", variables: [], onSubjectChange: (value) => firstChanges.push(value) }),
    createElement(SubjectBar, { subject: "Second", variables: [], onSubjectChange: (value) => secondChanges.push(value) }),
  );
  const html = renderToStaticMarkup(tree);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  let renderer;
  act(() => { renderer = create(tree); });
  t.after(() => act(() => renderer.unmount()));
  const inputs = renderer.root.findAllByType("input");
  const labels = renderer.root.findAllByType("label");
  for (const [index, input] of inputs.entries()) {
    assert.equal(labels[index].props.htmlFor, input.props.id);
    assert.equal(renderer.root.findByProps({ id: input.props["aria-describedby"] }).children.join(""), `${input.props.value.length}/128`);
  }
  act(() => inputs[1].props.onChange({ target: { value: "Second updated" } }));
  assert.deepEqual(firstChanges, []);
  assert.deepEqual(secondChanges, ["Second updated"]);
});
