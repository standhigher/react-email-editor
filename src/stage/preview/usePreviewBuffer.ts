import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { viewportWidth } from "../../render/layout";
import { createPreviewBuffer, previewBufferReducer } from "./buffer";
import { PREVIEW_DEBOUNCE_MS, PREVIEW_MAX_WAIT_MS } from "./constants";
import type { PreviewAttempt, PreviewSource } from "./types";

export function usePreviewBuffer(source: PreviewSource, requested: boolean) {
  const [state, dispatch] = useReducer(previewBufferReducer, undefined, createPreviewBuffer);
  const [request, setRequest] = useState({ key: requested ? 1 : 0, force: false });
  const previousRequested = useRef(requested);
  const sourceRef = useRef(source);
  const pendingSince = useRef<number | null>(null);
  const attempted = useRef<PreviewAttempt | null>(null);
  const revision = useRef(0);

  useLayoutEffect(() => { sourceRef.current = source; }, [source]);

  const flush = useCallback(() => setRequest((value) => ({ ...value, key: value.key + 1, force: false })), []);
  useEffect(() => {
    const enteringPreview = requested && !previousRequested.current;
    previousRequested.current = requested;
    const newRequest = request.key > 0 && attempted.current?.requestKey !== request.key;
    const force = newRequest && request.force;
    if (attempted.current?.source === source && !force) {
      attempted.current.requestKey = request.key;
      return;
    }
    const immediate = enteringPreview || newRequest;
    pendingSince.current ??= Date.now();
    const remaining = Math.max(0, PREVIEW_MAX_WAIT_MS - (Date.now() - pendingSince.current));
    let idle: number | undefined;
    let cancelled = false;

    const generate = () => {
      if (cancelled || sourceRef.current !== source) return;
      attempted.current = { source, requestKey: request.key };
      pendingSince.current = null;
      try {
        const html = source.config.toHtml(source.document, { resolveHtmlTemplates: true, variables: source.variables });
        dispatch({ type: "generated", snapshot: { id: ++revision.current, source, html, width: viewportWidth(source.device, source.document.body), status: "loading" }, force });
      } catch (error) {
        dispatch({ type: "failed", failure: { source, message: error instanceof Error ? error.message : String(error) || "Email preview failed." } });
      }
    };

    const delay = immediate ? 0 : Math.min(PREVIEW_DEBOUNCE_MS, remaining);
    const timer = setTimeout(() => {
      if (immediate || typeof requestIdleCallback !== "function") generate();
      else idle = requestIdleCallback(generate, { timeout: Math.max(1, remaining - delay) });
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (idle !== undefined) cancelIdleCallback(idle);
    };
  }, [source, requested, request]);

  const markReady = useCallback((id: number) => {
    dispatch({ type: "ready", id, source: sourceRef.current });
  }, []);
  const markFailed = useCallback((id: number, message: string) => {
    dispatch({ type: "failed", id, failure: { source: sourceRef.current, message } });
  }, []);
  const retry = useCallback(() => setRequest((value) => ({ ...value, key: value.key + 1, force: true })), []);
  const front = state.front === null ? null : state.frames[state.front];
  const failure = state.failure?.source === source ? state.failure : null;
  const displayFailure = failure ?? (state.front === null ? state.failure : null);
  return { ...state, failure, displayFailure, ready: front?.source === source, markReady, markFailed, flush, retry };
}
