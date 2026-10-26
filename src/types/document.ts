export interface EmailGlobalSettings {
  textColor: string;
  backgroundColor: string;
  contentWidth: number;
  contentAlign: "left" | "center" | "right";
  fontFamily: string;
  fontWeight: "normal" | "bold";
}

export interface EmailDocument {
  version: 1;
  subject?: string;
  global: EmailGlobalSettings;
  blocks: EmailBlockNode[];
}

export interface EmailBlockNode {
  id: string;
  type: string;
  fields: Record<string, unknown>;
  style?: EmailBlockStyle;
  /** Optional sample data used when rendering template HTML in the editor and preview. */
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
