import { createElement, useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";
import { useEmailEditorConfig } from "../../dist/index.js";

// 配置纯行为测试仍通过公开 Hook 创建配置，无需挂载整个编辑器界面。
export function renderConfig(options) {
  let config;
  function Harness() {
    const value = useEmailEditorConfig(options);
    useLayoutEffect(() => { config = value; }, [value]);
    return null;
  }
  let renderer;
  try {
    act(() => { renderer = create(createElement(Harness)); });
  } finally {
    if (renderer) act(() => renderer.unmount());
  }
  return config;
}
