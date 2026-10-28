"use client";

import { useEffect, useInsertionEffect, useLayoutEffect, useState } from "react";
import type { EmailEditorInstance, UseEmailEditorOptions } from "../types/editor";
import { createEditorStore } from "./editor-store";

const useOptionsEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useEmailEditor(options: UseEmailEditorOptions = {}): EmailEditorInstance {
  const [store] = useState(() => createEditorStore(options));
  // 先发布已提交的配置，保证子组件的 layout effect 读到新值。
  // insertion effect 内不触发订阅或用户回调，避免在此阶段调度 React 更新。
  useInsertionEffect(() => { store.updateOptions(options); });
  useOptionsEffect(store.flushOptions);
  return store.editor;
}
