import { ensureEmailDocument } from "../document/create-document";
import type { EmailDocument } from "../types/document";
import type { BlockPlugin, ControlSchema, ValidationIssue } from "./types";

interface ControlIssue {
  controlPath: string;
  message: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 仅接收归一化字段；汇总问题时不再调用 read。 */
export function collectControlIssues(schema: ControlSchema, values: Record<string, unknown>, path = ""): ControlIssue[] {
  const issues: ControlIssue[] = [];
  for (const [name, spec] of Object.entries(schema)) {
    const location = path ? `${path}.${name}` : name;
    try {
      const message = spec.validateValue?.(values[name]);
      if (message) issues.push({ controlPath: location, message });
    } catch (error) {
      issues.push({ controlPath: location, message: errorMessage(error) });
    }
    const value = values[name];
    if (spec.kind === "list" && spec.itemControls && Array.isArray(value)) {
      value.forEach((item, index) => issues.push(...collectControlIssues(spec.itemControls!, item, `${location}[${index}]`)));
    }
  }
  return issues;
}

export function validateControls(schema: ControlSchema, values: Record<string, unknown>, path = ""): void {
  const issues = collectControlIssues(schema, values, path);
  if (issues.length) throw new Error(issues.map((issue) => `${issue.controlPath}: ${issue.message}`).join("; "));
}

export function validateDocument(document: EmailDocument, definitions: readonly BlockPlugin[]): ValidationIssue[] {
  return ensureEmailDocument(document).blocks.flatMap((block): ValidationIssue[] => {
    const plugin = definitions.find((item) => item.type === block.type);
    const location = { blockId: block.id, blockType: block.type };
    if (!plugin) return [{ ...location, controlPath: "", message: `Missing block plugin: ${block.type}` }];
    const source = structuredClone(block.controls ?? {});
    return Object.entries(plugin.schema).flatMap(([name, spec]): ValidationIssue[] => {
      try {
        const value = spec.read(source[name]);
        return collectControlIssues({ [name]: spec }, { [name]: value }).map((issue) => ({ ...location, ...issue }));
      } catch (error) {
        return [{ ...location, controlPath: name, message: errorMessage(error) }];
      }
    });
  });
}
