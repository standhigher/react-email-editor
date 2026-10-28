import { useCallback, useState, useSyncExternalStore } from "react";
import { SUBJECT_MAX_LENGTH } from "../constants/editor";
import {
  duplicateBlockNode, insertBlockNode, moveBlockBy, removeBlockNode, reorderBlockNodes,
  updateBlockControls, updateBlockStyle, updateBodySettings, withSubject,
} from "../document/mutations";
import { getBlockDefinition } from "../document/registry";
import type { EmailEditorInstance, EditorSession } from "../types/editor";
import type { EmailBodySettings } from "../types/document";
import { getEditorStore } from "./editor-store";

export function useEditorSession(editor: EmailEditorInstance): EditorSession {
  const store = getEditorStore(editor);
  const { document, config, variables, resetKey } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const definitions = config.definitions;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previousReset, setPreviousReset] = useState({ editor, resetKey });
  if (previousReset.editor !== editor || previousReset.resetKey !== resetKey) {
    setPreviousReset({ editor, resetKey });
    setSelectedId(null);
  }
  // 回调总是读取实例最新文档，连续操作无需等待 React 重新渲染。
  const commit = store.commit;
  const selectBlock = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const insertBlock = useCallback(
    (type: string, index?: number) => {
      const node = definitions.some((definition) => definition.type === type) ? config.createBlock(type) : null;
      if (!node) return false;
      commit(insertBlockNode(store.getSnapshot().document, node, index));
      setSelectedId(node.id);
      return true;
    },
    [commit, definitions, config, store],
  );

  const updateControls = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      const current = store.getSnapshot().document;
      const next = updateBlockControls(current, id, patch);
      if (next !== current) commit(next);
    },
    [commit, store],
  );

  const updateControl = useCallback(
    (id: string, name: string, value: unknown) => updateControls(id, { [name]: value }),
    [updateControls],
  );

  const updateStyle = useCallback(
    (id: string, styleId: string, value: string) => {
      commit(updateBlockStyle(store.getSnapshot().document, id, styleId, value));
    },
    [commit, store],
  );

  const updateBody = useCallback(
    (patch: Partial<EmailBodySettings>) => {
      const next = updateBodySettings(store.getSnapshot().document, patch);
      store.commit(next, true);
    },
    [store],
  );

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      commit(moveBlockBy(store.getSnapshot().document, id, direction));
    },
    [commit, store],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      commit(duplicateBlockNode(store.getSnapshot().document, id));
    },
    [commit, store],
  );

  const removeBlock = useCallback(
    (id: string) => {
      commit(removeBlockNode(store.getSnapshot().document, id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [commit, store],
  );

  const reorderBlocks = useCallback(
    (activeId: string, overId: string) => {
      commit(reorderBlockNodes(store.getSnapshot().document, activeId, overId));
    },
    [commit, store],
  );

  const setSubject = useCallback(
    (subject: string) => {
      commit(withSubject(store.getSnapshot().document, subject.slice(0, SUBJECT_MAX_LENGTH)));
    },
    [commit, store],
  );

  const selectedBlock = document.blocks.find((block) => block.id === selectedId) ?? null;
  const selectedDefinition = selectedBlock ? getBlockDefinition(selectedBlock.type, definitions) : undefined;

  return {
    ...editor,
    document, definitions, config, variables, resetKey,
    selectedId, selectedBlock, selectedDefinition,
    selectBlock, insertBlock, updateControl, updateControls, updateStyle, updateBody,
    moveBlock, duplicateBlock, removeBlock, reorderBlocks, setSubject,
  };
}
