import { createContext, type RefObject } from "react";

export const ToolbarBoundaryContext = createContext<RefObject<HTMLElement | null> | null>(null);
