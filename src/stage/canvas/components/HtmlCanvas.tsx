import { useCallback, useEffect, useRef } from "react";
interface HtmlCanvasProps {
  html: string;
  onSelect: () => void;
}

/** HTML 标签内容用 iframe 隔离 CSS，纯文本直接渲染；事件交给外层区块。 */
export function HtmlCanvas({ html, onSelect }: HtmlCanvasProps) {
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
      // 先按画布宽度排版，让邮件自己的响应式规则生效，再缩小剩余的固定宽内容。
      frame.style.width = `${availableWidth}px`;
      frame.style.height = "1px";
      const contentWidth = Math.max(availableWidth, document.documentElement.scrollWidth, document.body.scrollWidth);
      frame.style.width = `${contentWidth}px`;
      const contentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 24);
      const scale = availableWidth / contentWidth;
      frame.style.height = `${contentHeight}px`;
      frame.style.transform = `scale(${scale})`;
      container.style.height = `${contentHeight * scale}px`;
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
        aria-label="Select HTML block"
        tabIndex={-1}
        onPointerDown={() => onSelect()}
        onClick={() => onSelect()}
      />
      <iframe
        ref={frameRef}
        className="ree-html-canvas-frame"
        title="HTML block preview"
        srcDoc={html}
        sandbox="allow-same-origin"
        tabIndex={-1}
        onLoad={observeContent}
      />
    </div>
  );
}
