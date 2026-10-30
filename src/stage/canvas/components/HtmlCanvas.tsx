import { useEditorTranslation } from "../../../i18n/context";
import { useCallback, useEffect, useRef } from "react";
import { extractHeadStyles } from "../../../render/head-styles";

interface HtmlCanvasProps {
  html: string;
  baseCss?: string;
  onSelect: () => void;
}

function frameHtml(html: string, baseCss: string): string {
  const { html: body, styles } = extractHeadStyles(html);
  return `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;}body{display:flow-root;${baseCss}}</style>${styles}</head><body>${body}</body></html>`;
}

/** HTML 标签内容用 iframe 隔离 CSS，纯文本直接渲染；事件交给外层区块。 */
export function HtmlCanvas({ html, baseCss = "", onSelect }: HtmlCanvasProps) {
  const t = useEditorTranslation();
  const hasHtmlTag = /<\/?[a-z][\w:-]*(?:\s[^>]*)?>/i.test(html);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<() => void>();

  const observeContent = useCallback(() => {
    cleanupRef.current?.();
    const container = containerRef.current;
    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!container || !frame || !document?.body) return;

    const window = document.defaultView;
    if (!window) return;
    let animationFrame = 0;

    const fit = () => {
      const availableWidth = container.clientWidth;
      if (!availableWidth) return;
      frame.style.width = `${availableWidth}px`;
      frame.style.height = "1px";
      const contentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      frame.style.height = `${contentHeight}px`;
      container.style.height = `${contentHeight}px`;
    };

    const scheduleFit = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(fit);
    };

    // 只观察内容和容器宽度，避免 iframe 自身高度更新导致循环。
    const observer = new window.ResizeObserver(scheduleFit);
    let previousWidth = container.clientWidth;
    const containerObserver = new window.ResizeObserver(() => {
      if (container.clientWidth === previousWidth) return;
      previousWidth = container.clientWidth;
      scheduleFit();
    });
    containerObserver.observe(container);
    for (const child of document.body.children) observer.observe(child);
    document.addEventListener("load", scheduleFit, true);
    fit();
    cleanupRef.current = () => {
      observer.disconnect();
      containerObserver.disconnect();
      document.removeEventListener("load", scheduleFit, true);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), [hasHtmlTag, html]);

  if (!hasHtmlTag) {
    return (
      <div
        className="ree-html-canvas ree-html-canvas-text"
        onClick={onSelect}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="ree-html-canvas"
      onClick={() => onSelect()}
    >
      <button
        type="button"
        className="ree-html-canvas-hitbox"
        aria-label={t("editor.selectBlock")}
        tabIndex={-1}
        onPointerDown={() => onSelect()}
        onClick={() => onSelect()}
      />
      <iframe
        ref={frameRef}
        className="ree-html-canvas-frame"
        title={t("preview.html")}
        srcDoc={frameHtml(html, baseCss)}
        sandbox="allow-same-origin"
        tabIndex={-1}
        onLoad={observeContent}
      />
    </div>
  );
}
