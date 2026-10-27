import { useLayoutEffect, useRef, type RefObject } from "react";

export function useAnchoredToolbar(
  anchorRef: RefObject<HTMLElement | null>,
  active: boolean,
  compact = false,
) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!active) return;
    const anchor = anchorRef.current;
    const toolbar = toolbarRef.current;
    if (!anchor || !toolbar) return;
    const ownerDocument = anchor.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return;

    const place = () => {
      const block = anchor.closest(".ree-block") ?? anchor;
      const rect = block.getBoundingClientRect();
      const offscreen = rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > ownerWindow.innerHeight;
      if (offscreen) {
        toolbar.classList.remove("is-placed");
        return;
      }
      const width = Math.min(rect.width, ownerWindow.innerWidth - 16);
      toolbar.style.width = compact ? "max-content" : `${width}px`;
      toolbar.style.maxWidth = `${width}px`;
      let previousBottom: number | null = null;
      for (const group of toolbar.querySelectorAll<HTMLElement>(":scope > .ree-rte-group")) {
        group.classList.toggle("is-row-start", previousBottom === null || group.offsetTop >= previousBottom);
        previousBottom = group.offsetTop + group.offsetHeight;
      }
      const height = toolbar.offsetHeight;
      let top = rect.top - height - 4;
      if (top < 8) {
        const below = rect.bottom + 4;
        top = below + height <= ownerWindow.innerHeight - 8 ? below : 8;
      }
      let left = rect.left;
      const maxLeft = Math.max(8, ownerWindow.innerWidth - toolbar.offsetWidth - 8);
      if (left > maxLeft) left = maxLeft;
      if (left < 8) left = 8;
      toolbar.style.top = `${top}px`;
      toolbar.style.left = `${left}px`;
      toolbar.classList.add("is-placed");
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(toolbar);
    for (const group of toolbar.querySelectorAll(".ree-rte-group")) observer.observe(group);
    observer.observe(anchor.closest(".ree-block") ?? anchor);
    ownerDocument.addEventListener("scroll", place, true);
    ownerWindow.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      ownerDocument.removeEventListener("scroll", place, true);
      ownerWindow.removeEventListener("resize", place);
    };
  }, [active, anchorRef, compact]);

  return toolbarRef;
}
