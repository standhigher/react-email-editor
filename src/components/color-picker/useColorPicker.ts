import { useId, useLayoutEffect, useRef, useState } from "react";

export function useColorPicker(onOpen?: () => void) {
  const id = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!open || !panel || !anchor) return;
    const ownerDocument = anchor.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return;

    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const left = Math.max(8, Math.min(rect.left, ownerWindow.innerWidth - width - 8));
      const below = rect.bottom + 6;
      const top = below + height <= ownerWindow.innerHeight - 8 ? below : Math.max(8, rect.top - height - 6);
      panel.style.left = `${left}px`;
      panel.style.top = `${Math.min(top, Math.max(8, ownerWindow.innerHeight - height - 8))}px`;
    };
    const onToggle = () => {
      if (!panel.matches(":popover-open")) setOpen(false);
    };
    panel.setAttribute("popover", "auto");
    panel.addEventListener("toggle", onToggle);
    panel.showPopover();
    place();
    panel.querySelector<HTMLInputElement>('input[type="text"]')?.focus({ preventScroll: true });
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    ownerDocument.addEventListener("scroll", place, true);
    ownerWindow.addEventListener("resize", place);
    return () => {
      panel.removeEventListener("toggle", onToggle);
      panel.hidePopover();
      observer.disconnect();
      ownerDocument.removeEventListener("scroll", place, true);
      ownerWindow.removeEventListener("resize", place);
    };
  }, [open]);

  return {
    id,
    open,
    anchorRef,
    panelRef,
    toggle: () => {
      if (!open) onOpen?.();
      setOpen(!open);
    },
    close: () => {
      setOpen(false);
      anchorRef.current?.querySelector("button")?.focus({ preventScroll: true });
    },
  };
}
