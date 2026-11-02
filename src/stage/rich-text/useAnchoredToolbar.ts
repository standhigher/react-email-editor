import { useLayoutEffect, useRef, type RefObject } from "react";
import { TOOLBAR_ANCHOR_GAP, TOOLBAR_BOUNDARY_PADDING, TOOLBAR_VISIBLE_ANCHOR_HEIGHT } from "./constants";
import { getToolbarBoundaries, getToolbarBounds } from "./toolbar-boundaries";

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
    const block = anchor.closest<HTMLElement>(".ree-block") ?? anchor;
    const actions = block.querySelector<HTMLElement>(":scope > .ree-block-toolbar");
    const canvas = anchor.closest<HTMLElement>(".ree-canvas");
    const previousSpace = canvas?.style.getPropertyValue("--ree-toolbar-space") ?? "";
    const boundaries = getToolbarBoundaries(anchor);

    const place = (reveal: boolean) => {
      const bounds = getToolbarBounds(anchor);
      const rect = block.getBoundingClientRect();
      const offscreen = bounds.right <= bounds.left || bounds.bottom <= bounds.top
        || rect.width === 0 || rect.height === 0
        || rect.bottom <= bounds.top || rect.top >= bounds.bottom
        || rect.right <= bounds.left || rect.left >= bounds.right;
      if (offscreen) {
        toolbar.classList.remove("is-placed");
        return;
      }
      const width = Math.min(rect.width, bounds.right - bounds.left);
      toolbar.style.width = compact ? "max-content" : `${width}px`;
      toolbar.style.maxWidth = `${width}px`;
      const actionHeight = actions?.offsetHeight ?? 0;
      toolbar.style.maxHeight = `${Math.max(0, bounds.bottom - bounds.top - actionHeight - TOOLBAR_ANCHOR_GAP * 2 - TOOLBAR_VISIBLE_ANCHOR_HEIGHT)}px`;
      let previousBottom: number | null = null;
      for (const group of toolbar.querySelectorAll<HTMLElement>(":scope > .ree-rte-group")) {
        group.classList.toggle("is-row-start", previousBottom === null || group.offsetTop >= previousBottom);
        previousBottom = group.offsetTop + group.offsetHeight;
      }
      const height = toolbar.offsetHeight;
      let top = rect.top - height - TOOLBAR_ANCHOR_GAP;
      if (top < bounds.top) {
        // 下翻后避开左下角 Action 栏，不能盖住复制、删除和收起按钮。
        top = Math.max(rect.bottom, actions?.getBoundingClientRect().bottom ?? rect.bottom) + TOOLBAR_ANCHOR_GAP;
        if (reveal && canvas && top + height > bounds.bottom) {
          // 最后一个长区块也必须有足够的滚动余量；不把工具栏向上推回 Action 栏。
          canvas.style.setProperty("--ree-toolbar-space", `${height + actionHeight + TOOLBAR_ANCHOR_GAP * 2 + TOOLBAR_BOUNDARY_PADDING}px`);
          canvas.scrollTop += top + height - bounds.bottom;
          top = Math.max(block.getBoundingClientRect().bottom, actions?.getBoundingClientRect().bottom ?? 0) + TOOLBAR_ANCHOR_GAP;
        }
      }
      const left = Math.max(bounds.left, Math.min(rect.left, bounds.right - toolbar.offsetWidth));
      toolbar.style.top = `${top}px`;
      toolbar.style.left = `${left}px`;
      toolbar.classList.toggle("is-placed", top >= bounds.top && top + height <= bounds.bottom + 1);
    };

    const reveal = () => place(true);
    const onScroll = () => place(false);
    reveal();
    const observer = new ownerWindow.ResizeObserver(reveal);
    observer.observe(toolbar);
    for (const group of toolbar.querySelectorAll(".ree-rte-group")) observer.observe(group);
    observer.observe(block);
    if (actions) observer.observe(actions);
    for (const boundary of boundaries) observer.observe(boundary);
    ownerDocument.addEventListener("scroll", onScroll, true);
    ownerWindow.addEventListener("resize", reveal);
    return () => {
      observer.disconnect();
      ownerDocument.removeEventListener("scroll", onScroll, true);
      ownerWindow.removeEventListener("resize", reveal);
      if (previousSpace) canvas?.style.setProperty("--ree-toolbar-space", previousSpace);
      else canvas?.style.removeProperty("--ree-toolbar-space");
    };
  }, [active, anchorRef, compact]);

  return toolbarRef;
}
