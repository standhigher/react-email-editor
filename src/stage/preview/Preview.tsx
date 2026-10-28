import { useCallback, useEffect, useMemo, useRef } from "react";
import { viewportWidth } from "../../render/layout";
import { documentToHtml } from "../../render/document-html";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailDocument } from "../../types/document";
import type { EditorDevice } from "../../types/editor";

interface PreviewProps {
  document: EmailDocument;
  definitions: BlockDefinition[];
  variables: Variable[];
  device: EditorDevice;
}

export function Preview({ document, definitions, variables, device }: PreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<() => void>();
  const html = useMemo(
    () => documentToHtml(document, definitions, {
      resolveHtmlTemplates: true,
      variables,
    }),
    [document, definitions, variables],
  );

  const observeContent = useCallback(() => {
    cleanupRef.current?.();
    const frame = frameRef.current;
    const frameDocument = frame?.contentDocument;
    const frameWindow = frameDocument?.defaultView;
    if (!frame || !frameDocument?.body || !frameWindow) return;

    let animationFrame = 0;
    const fit = () => {
      frame.style.height = `${frameDocument.body.getBoundingClientRect().height}px`;
    };
    const scheduleFit = () => {
      frameWindow.cancelAnimationFrame(animationFrame);
      animationFrame = frameWindow.requestAnimationFrame(fit);
    };

    // 正文高度独立于 iframe 视口，内容、图片和设备宽度变化后重新测量。
    const observer = new frameWindow.ResizeObserver(scheduleFit);
    observer.observe(frameDocument.body);
    frameDocument.addEventListener("load", scheduleFit, true);
    fit();
    cleanupRef.current = () => {
      observer.disconnect();
      frameDocument.removeEventListener("load", scheduleFit, true);
      frameWindow.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), [html]);

  return (
    <div className="ree-preview-stage">
      <div
        className="ree-email-viewport"
        style={{
          width: viewportWidth(device, document.body),
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <iframe
          ref={frameRef}
          className="ree-preview-frame"
          title="Email preview"
          srcDoc={html}
          onLoad={observeContent}
          style={{
            backgroundColor: "#ffffff",
          }}
        />
      </div>
    </div>
  );
}
