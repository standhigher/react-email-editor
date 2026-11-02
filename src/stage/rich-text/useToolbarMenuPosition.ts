import { useContext, useLayoutEffect, useRef, type RefObject } from "react";
import { TOOLBAR_ANCHOR_GAP } from "./constants";
import { ToolbarBoundaryContext } from "./toolbar-boundary-context";
import { getToolbarBoundaries, getToolbarBounds } from "./toolbar-boundaries";

export function useToolbarMenuPosition(rootRef: RefObject<HTMLElement | null>, open: boolean, align: "start" | "end") {
  const anchorRef = useContext(ToolbarBoundaryContext);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const menu = menuRef.current;
    const anchor = anchorRef?.current;
    if (!open || !root || !menu || !anchor) return;
    const ownerDocument = root.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return;
    const toolbar = root.closest<HTMLElement>(".ree-rte-toolbar");
    const place = () => {
      const bounds = getToolbarBounds(anchor);
      const rect = root.getBoundingClientRect();
      const width = Math.max(0, bounds.right - bounds.left);
      menu.style.setProperty("--ree-menu-width", `${width}px`);
      menu.style.maxHeight = `${Math.max(0, bounds.bottom - bounds.top)}px`;
      const below = Math.max(0, bounds.bottom - rect.bottom - TOOLBAR_ANCHOR_GAP);
      const above = Math.max(0, rect.top - bounds.top - TOOLBAR_ANCHOR_GAP);
      const up = menu.offsetHeight > below && above > below;
      menu.style.maxHeight = `${up ? above : below}px`;
      const left = align === "end" ? rect.right - menu.offsetWidth : rect.left;
      menu.style.left = `${Math.max(bounds.left, Math.min(left, bounds.right - menu.offsetWidth))}px`;
      menu.style.top = `${up ? rect.top - TOOLBAR_ANCHOR_GAP - menu.offsetHeight : rect.bottom + TOOLBAR_ANCHOR_GAP}px`;
    };
    place();
    const observer = new ownerWindow.ResizeObserver(place);
    observer.observe(root);
    observer.observe(menu);
    for (const boundary of getToolbarBoundaries(anchor)) observer.observe(boundary);
    // 工具栏换行或滚动后，位置可变而尺寸不变。
    const mutations = new ownerWindow.MutationObserver(place);
    if (toolbar) mutations.observe(toolbar, { attributes: true, attributeFilter: ["style"] });
    ownerDocument.addEventListener("scroll", place, true);
    ownerWindow.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      ownerDocument.removeEventListener("scroll", place, true);
      ownerWindow.removeEventListener("resize", place);
    };
  }, [align, anchorRef, open, rootRef]);

  return menuRef;
}
