import { TOOLBAR_BOUNDARY_PADDING } from "./constants";

export interface ToolbarBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function getToolbarBoundaries(anchor: HTMLElement): HTMLElement[] {
  const ownerWindow = anchor.ownerDocument.defaultView;
  const boundaries: HTMLElement[] = [];
  if (!ownerWindow) return boundaries;
  for (let node = anchor.closest<HTMLElement>(".ree-canvas") ?? anchor.parentElement; node; node = node.parentElement) {
    const style = ownerWindow.getComputedStyle(node);
    if (node.matches(".ree-canvas") || /(auto|scroll|hidden|clip)/.test(`${style.overflowX} ${style.overflowY}`)) {
      boundaries.push(node);
    }
  }
  return boundaries;
}

export function getToolbarBounds(anchor: HTMLElement): ToolbarBounds {
  const ownerWindow = anchor.ownerDocument.defaultView!;
  const padding = TOOLBAR_BOUNDARY_PADDING;
  const bounds = { top: padding, left: padding, right: ownerWindow.innerWidth - padding, bottom: ownerWindow.innerHeight - padding };
  for (const boundary of getToolbarBoundaries(anchor)) {
    const rect = boundary.getBoundingClientRect();
    bounds.top = Math.max(bounds.top, rect.top + boundary.clientTop + padding);
    bounds.left = Math.max(bounds.left, rect.left + boundary.clientLeft + padding);
    bounds.right = Math.min(bounds.right, rect.left + boundary.clientLeft + boundary.clientWidth - padding);
    bounds.bottom = Math.min(bounds.bottom, rect.top + boundary.clientTop + boundary.clientHeight - padding);
  }
  return bounds;
}
