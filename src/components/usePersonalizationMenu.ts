import { useLayoutEffect, useState, type RefObject } from "react";

interface MenuPosition {
  left: number;
  top: number;
  maxHeight: number;
}

export function usePersonalizationMenu(
  open: boolean,
  rootRef: RefObject<HTMLDivElement>,
  menuRef: RefObject<HTMLDivElement>,
  focusOnOpen: RefObject<boolean>,
  setOpen: (open: boolean) => void,
  keyboardScopeRef?: RefObject<HTMLElement | null>,
) {
  const [position, setPosition] = useState<MenuPosition>({ left: 0, top: 0, maxHeight: 240 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const menu = menuRef.current;
    if (!open || !root || !menu) return;
    const ownerDocument = root.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return;

    const place = () => {
      const anchor = root.getBoundingClientRect();
      const inputBounds = root.closest(".ree-input-with-variable")?.getBoundingClientRect() ?? anchor;
      const width = menu.offsetWidth;
      const height = Math.min(menu.scrollHeight + 2, 240);
      const below = Math.max(0, ownerWindow.innerHeight - inputBounds.bottom - 8);
      const above = Math.max(0, inputBounds.top - 8);
      const up = below < height && above > below;
      const maxHeight = Math.min(240, up ? above : below);
      const left = anchor.left + width > ownerWindow.innerWidth - 8 ? anchor.right - width : anchor.left;
      setPosition({
        left: Math.max(8, Math.min(left, ownerWindow.innerWidth - width - 8)),
        top: up ? inputBounds.top - Math.min(height, maxHeight) : inputBounds.bottom,
        maxHeight,
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node) && !menu.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Node;
      if (!root.contains(target) && !menu.contains(target) && !keyboardScopeRef?.current?.contains(target)) return;
      if (event.key === "Tab" && menu.contains(target)) {
        const buttons = menu.querySelectorAll("button");
        if (target !== (event.shiftKey ? buttons[0] : buttons[buttons.length - 1])) return;
        if (event.shiftKey) event.preventDefault();
        setOpen(false);
        root.querySelector("button")?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      root.querySelector("button")?.focus({ preventScroll: true });
    };

    menu.setAttribute("popover", "manual");
    menu.showPopover();
    place();
    if (focusOnOpen.current) menu.querySelector("button")?.focus({ preventScroll: true });
    const observer = new ResizeObserver(place);
    observer.observe(root);
    observer.observe(menu);
    ownerWindow.addEventListener("resize", place);
    ownerDocument.addEventListener("scroll", place, true);
    ownerDocument.addEventListener("pointerdown", onPointerDown, true);
    ownerDocument.addEventListener("keydown", onKeyDown, true);
    return () => {
      menu.hidePopover();
      observer.disconnect();
      ownerWindow.removeEventListener("resize", place);
      ownerDocument.removeEventListener("scroll", place, true);
      ownerDocument.removeEventListener("pointerdown", onPointerDown, true);
      ownerDocument.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, rootRef, menuRef, focusOnOpen, setOpen, keyboardScopeRef]);

  return position;
}
