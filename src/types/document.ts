export interface EmailDocument {
  version: 1;
  subject?: string;
  blocks: EmailBlockNode[];
}

export interface EmailBlockNode {
  id: string;
  type: string;
  fields: Record<string, unknown>;
  style?: EmailBlockStyle;
  /** Optional sample data used only when previewing template HTML on the canvas. */
  defaultData?: Record<string, unknown>;
}

export interface EmailBlockStyle {
  dimension?: {
    padding?: string;
  };
  typography?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    textAlign?: "left" | "center" | "right";
  };
  decorations?: {
    backgroundColor?: string;
    borderRadius?: string;
  };
}
