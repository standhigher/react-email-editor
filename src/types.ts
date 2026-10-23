/**
 * 邮件模板编辑器的核心数据模型。
 *
 * 三层概念：
 * - EmailDocument    完整文档（唯一数据源）
 * - EmailBlockNode   文档里的一个区块实例
 * - BlockDefinition  区块的"定义/schema"，决定配置区展示哪些控件、如何渲染 HTML
 */

import type { ReactNode } from "react";

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

export interface Variable {
  name: string;
  label: string;
  description?: string;
}

// ---------- 区块定义 ----------

export type FieldType =
  | "text"
  | "textarea"
  | "html"
  | "url"
  | "number"
  | "color"
  | "select";

export interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  defaultValue?: unknown;
  placeholder?: string;
  options?: { label: string; value: string }[];
  rows?: number;
}

export type StyleGroup = "dimension" | "typography" | "decorations";

export interface StyleFieldConfig {
  /** 形如 "typography.fontSize"，决定读写 style 的哪一项 */
  id: string;
  group: StyleGroup;
  label: string;
  control: "text" | "color" | "alignment" | "select";
  options?: { label: string; value: string }[];
}

/** 区块渲染上下文：同一份数据在"画布静态 demo"与"邮件 Go 模板"两种模式下输出。 */
export interface BlockRenderContext {
  block: EmailBlockNode;
  fields: Record<string, unknown>;
  style: EmailBlockStyle;
  /** 画布 = 静态 demo；邮件 = 含 Go 指令（控制结构只出现在 email 分支）。 */
  mode: "canvas" | "email";
}

export interface BlockDefinition {
  type: string;
  title: string;
  /** SVG 字符串或 React 节点 */
  icon?: ReactNode | string;
  description?: string;
  /** 配置区"内容"字段 */
  fields?: FieldConfig[];
  /** 配置区"样式"字段 */
  styleFields?: StyleFieldConfig[];
  defaultFields?: Record<string, unknown>;
  defaultStyle?: EmailBlockStyle;
  /** 是否在画布内内联富文本编辑（内容存在 fields.html） */
  inlineEdit?: boolean;
  /** 输出 HTML 片段（email 模式可含 Go 指令，canvas 模式为静态 demo） */
  render: (ctx: BlockRenderContext) => string;
}

export const STYLE_GROUPS: { group: StyleGroup; label: string }[] = [
  { group: "dimension", label: "尺寸" },
  { group: "typography", label: "排版" },
  { group: "decorations", label: "装饰" },
];
