import { useEditorTranslation } from "../../i18n/context";
import { useLayoutEffect, useRef } from "react";
import { PREVIEW_LOAD_TIMEOUT_MS } from "./constants";
import type { PreviewSnapshot } from "./types";

interface PreviewFrameProps {
  snapshot: PreviewSnapshot;
  onReady: (id: number) => void;
  onFailed: (id: number, message: string) => void;
}

export function PreviewFrame({ snapshot, onReady, onFailed }: PreviewFrameProps) {
  const t = useEditorTranslation();
  const translationRef = useRef(t);
  useLayoutEffect(() => { translationRef.current = t; }, [t]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { id, html } = snapshot;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const ownerWindow = frame?.ownerDocument.defaultView;
    if (!frame || !ownerWindow) return;
    let status: "loading" | "ready" | "failed" | "disposed" = "loading";
    let stopObserving: (() => void) | undefined;
    const fail = (message: string) => {
      if (status !== "loading") return;
      status = "failed";
      clearTimeout(timer);
      stopObserving?.();
      stopObserving = undefined;
      onFailed(id, message);
    };
    const timer = setTimeout(() => fail(translationRef.current("preview.timeout")), PREVIEW_LOAD_TIMEOUT_MS);
    const observeContent = () => {
      if (status !== "loading") return;
      stopObserving?.();
      stopObserving = undefined;
      try {
        const frameDocument = frame.contentDocument;
        const frameWindow = frameDocument?.defaultView;
        if (!frameDocument?.body || !frameWindow) throw new Error(translationRef.current("preview.measureFailed"));
        let animationFrame = 0;
        let readyFrame = 0;
        const fit = () => {
          try {
            const height = frameDocument.body.getBoundingClientRect().height;
            if (!Number.isFinite(height) || height < 0) throw new Error(translationRef.current("preview.invalidHeight"));
            frame.style.height = `${Math.max(1, height)}px`;
            return true;
          } catch (error) {
            fail(error instanceof Error ? error.message : translationRef.current("preview.measureFailed"));
            return false;
          }
        };
        const scheduleFit = () => {
          ownerWindow.cancelAnimationFrame(animationFrame);
          animationFrame = ownerWindow.requestAnimationFrame(fit);
        };
        const observer = new frameWindow.ResizeObserver(scheduleFit);
        stopObserving = () => {
          observer.disconnect();
          frameDocument.removeEventListener("load", scheduleFit, true);
          ownerWindow.cancelAnimationFrame(animationFrame);
          ownerWindow.cancelAnimationFrame(readyFrame);
        };
        observer.observe(frameDocument.body);
        frameDocument.addEventListener("load", scheduleFit, true);
        if (!fit()) return;
        // 使用宿主窗口的时钟，隐藏的备用 iframe 也能完成测量。
        readyFrame = ownerWindow.requestAnimationFrame(() => {
          if (status !== "loading" || !fit()) return;
          status = "ready";
          clearTimeout(timer);
          onReady(id);
        });
      } catch (error) {
        fail(error instanceof Error ? error.message : translationRef.current("preview.loadFailed"));
      }
    };
    const loadError = () => fail(translationRef.current("preview.loadFailed"));
    frame.addEventListener("load", observeContent);
    frame.addEventListener("error", loadError);
    return () => {
      status = "disposed";
      clearTimeout(timer);
      stopObserving?.();
      frame.removeEventListener("load", observeContent);
      frame.removeEventListener("error", loadError);
    };
  }, [id, onReady, onFailed]);

  return <iframe ref={frameRef} className="ree-preview-frame" title={t("preview.title")} sandbox="allow-same-origin" srcDoc={html} />;
}
