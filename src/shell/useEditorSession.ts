import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EMPTY_BLOCK_DEFINITIONS, EMPTY_VARIABLES } from "./constants";
import { SUBJECT_MAX_LENGTH } from "../constants/editor";
import { createBlockNode } from "../document/create-block";
import {
  createEmptyDocument,
  ensureEmailDocument,
  mergeEmailBody,
  sameEmailBody,
  resolveEmailBody,
} from "../document/create-document";
import {
  duplicateBlockNode,
  insertBlockNode,
  moveBlockBy,
  removeBlockNode,
  reorderBlockNodes,
  updateBlockField,
  updateBlockStyle,
  updateBodySettings,
  withSubject,
} from "../document/mutations";
import { getBlockDefinition, mergeBlockDefinitions } from "../document/registry";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailDocument, EmailBodySettings } from "../types/document";
import type { EditorSession } from "../types/editor";

interface UseEditorSessionOptions {
  initialDocument?: EmailDocument;
  body?: Partial<EmailBodySettings>;
  blocks?: BlockDefinition[];
  variables?: Variable[];
  onChange?: (document: EmailDocument) => void;
  onBodyChange?: (body: EmailBodySettings) => void;
}

export function useEditorSession({
  initialDocument,
  body,
  blocks = EMPTY_BLOCK_DEFINITIONS,
  variables = EMPTY_VARIABLES,
  onChange,
  onBodyChange,
}: UseEditorSessionOptions): EditorSession {
  const definitions = useMemo(() => mergeBlockDefinitions(blocks), [blocks]);
  const [document, setDocument] = useState<EmailDocument>(() => {
    const base = ensureEmailDocument(
      structuredClone(initialDocument ?? createEmptyDocument()),
    );
    if (body === undefined) return base;
    return { ...base, body: mergeEmailBody(base.body, body) };
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const documentRef = useRef(document);
  useLayoutEffect(() => {
    documentRef.current = document;
  }, [document]);

  const commit = useCallback(
    (next: EmailDocument) => {
      documentRef.current = next;
      setDocument(next);
      onChange?.(next);
    },
    [onChange],
  );

  useEffect(() => {
    if (body === undefined) return;
    const current = documentRef.current;
    const nextBody = mergeEmailBody(current.body, body);
    if (sameEmailBody(resolveEmailBody(current.body), nextBody)) return;
    commit({ ...current, body: nextBody });
  }, [body, commit]);

  const getDocument = useCallback(
    () => ensureEmailDocument(structuredClone(documentRef.current)),
    [],
  );

  const selectBlock = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const insertBlock = useCallback(
    (type: string, index?: number) => {
      const node = createBlockNode(type, definitions);
      if (!node) return false;
      commit(insertBlockNode(documentRef.current, node, index));
      setSelectedId(node.id);
      return true;
    },
    [commit, definitions],
  );

  const updateField = useCallback(
    (id: string, name: string, value: unknown) => {
      commit(updateBlockField(documentRef.current, id, name, value));
    },
    [commit],
  );

  const updateStyle = useCallback(
    (id: string, styleId: string, value: string) => {
      commit(updateBlockStyle(documentRef.current, id, styleId, value));
    },
    [commit],
  );

  const updateBody = useCallback(
    (patch: Partial<EmailBodySettings>) => {
      const next = updateBodySettings(documentRef.current, patch);
      commit(next);
      onBodyChange?.(next.body);
    },
    [commit, onBodyChange],
  );

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      commit(moveBlockBy(documentRef.current, id, direction));
    },
    [commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      commit(duplicateBlockNode(documentRef.current, id));
    },
    [commit],
  );

  const removeBlock = useCallback(
    (id: string) => {
      commit(removeBlockNode(documentRef.current, id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [commit],
  );

  const reorderBlocks = useCallback(
    (activeId: string, overId: string) => {
      commit(reorderBlockNodes(documentRef.current, activeId, overId));
    },
    [commit],
  );

  const setSubject = useCallback(
    (subject: string) => {
      commit(withSubject(documentRef.current, subject.slice(0, SUBJECT_MAX_LENGTH)));
    },
    [commit],
  );

  const resolvedDocument = useMemo(() => ensureEmailDocument(document), [document]);
  const selectedBlock =
    resolvedDocument.blocks.find((block) => block.id === selectedId) ?? null;
  const selectedDefinition = selectedBlock
    ? getBlockDefinition(selectedBlock.type, definitions)
    : undefined;

  return {
    document: resolvedDocument,
    getDocument,
    definitions,
    variables,
    selectedId,
    selectedBlock,
    selectedDefinition,
    selectBlock,
    insertBlock,
    updateField,
    updateStyle,
    updateBody,
    moveBlock,
    duplicateBlock,
    removeBlock,
    reorderBlocks,
    setSubject,
  };
}
