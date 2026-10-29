import { esc } from "../utils/html";
import type { TemplateData, TemplateEngine } from "../types/template";

interface TextNode {
  kind: "text";
  value: string;
}

interface ExpressionNode {
  kind: "expression";
  expression: string;
}

interface BranchNode {
  kind: "if" | "range" | "with";
  expression: string;
  children: TemplateNode[];
  alternate: TemplateNode[];
}

type TemplateNode = TextNode | ExpressionNode | BranchNode;

interface Token {
  text?: string;
  tag?: string;
}

interface ParseResult {
  nodes: TemplateNode[];
  nextIndex: number;
  stopTag?: "else" | "end";
}

const TOKEN_PATTERN = /\{\{(-[ \t\r\n])?([\s\S]*?)([ \t\r\n]-)?\}\}/g;
const UNSUPPORTED_IDENTIFIERS = new Set([
  "and", "or", "not", "len", "index", "slice", "call", "print", "printf", "println",
  "html", "js", "urlquery", "eq", "ne", "lt", "le", "gt", "ge", "break", "continue", "else", "end",
]);
const PATH_PATTERN = /^(?:\.|\$|(?:\$\.|\.)?[\p{L}_][\p{L}\p{Nd}_]*(?:\.[\p{L}_][\p{L}\p{Nd}_]*)*)$/u;

function supportsExpression(expression: string): boolean {
  if (PATH_PATTERN.test(expression) && !UNSUPPORTED_IDENTIFIERS.has(expression)) return true;
  if (/^-?\d+(?:\.\d+)?$/.test(expression)) return true;
  if (/^"(?:[^"\\]|\\.)*"$/.test(expression)) {
    try { JSON.parse(expression); return true; } catch { return false; }
  }
  return false;
}

interface BranchFrame {
  kind: string;
  hasElse: boolean;
}

/** Only decide whether the basic renderer can handle the entire input; not a Go validator. */
function supportsTokens(tokens: Token[]): boolean {
  const branches: BranchFrame[] = [];
  for (const token of tokens) {
    if (token.text !== undefined) {
      if (token.text.includes("{{")) return false;
      continue;
    }
    const tag = token.tag ?? "";
    const branch = /^(if|range|with)\s+([\s\S]+)$/.exec(tag);
    if (branch) {
      if (!supportsExpression(branch[2].trim())) return false;
      branches.push({ kind: branch[1], hasElse: false });
    } else if (tag === "end") {
      if (!branches.pop()) return false;
    } else if (tag === "else" || /^else\s+if\s+/.test(tag)) {
      const current = branches.at(-1);
      if (!current || current.hasElse) return false;
      if (tag === "else") current.hasElse = true;
      else if (current.kind !== "if" || !supportsExpression(tag.replace(/^else\s+if\s+/, ""))) return false;
    } else if (!supportsExpression(tag)) return false;
  }
  return branches.length === 0;
}

function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let trimNext = false;
  for (const match of template.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    let text = template.slice(lastIndex, index);
    if (trimNext) text = text.replace(/^[ \t\r\n]+/, "");
    if (match[1]) text = text.replace(/[ \t\r\n]+$/, "");
    if (text) tokens.push({ text });
    tokens.push({ tag: match[2].trim() });
    trimNext = Boolean(match[3]);
    lastIndex = index + match[0].length;
  }
  const tail = template.slice(lastIndex);
  if (tail) tokens.push({ text: trimNext ? tail.replace(/^[ \t\r\n]+/, "") : tail });
  return tokens;
}

function parseNodes(tokens: Token[], startIndex: number): ParseResult {
  const nodes: TemplateNode[] = [];
  let index = startIndex;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.text !== undefined) {
      nodes.push({ kind: "text", value: token.text });
      index += 1;
      continue;
    }

    const tag = token.tag ?? "";
    if (tag === "else" || /^else\s+if\s+/.test(tag)) {
      return { nodes, nextIndex: index, stopTag: "else" };
    }
    if (tag === "end") return { nodes, nextIndex: index, stopTag: "end" };

    const branchMatch = /^(if|range|with)\s+([\s\S]+)$/.exec(tag);
    if (branchMatch) {
      const branch = parseBranch(
        tokens,
        index,
        branchMatch[1] as BranchNode["kind"],
        branchMatch[2],
      );
      nodes.push(branch.node);
      index = branch.nextIndex + (tokens[branch.nextIndex]?.tag === "end" ? 1 : 0);
      continue;
    }

    nodes.push({ kind: "expression", expression: tag });
    index += 1;
  }
  return { nodes, nextIndex: index };
}

interface ParsedBranch {
  node: BranchNode;
  nextIndex: number;
}

function parseBranch(
  tokens: Token[],
  startIndex: number,
  kind: BranchNode["kind"],
  expression: string,
): ParsedBranch {
  const body = parseNodes(tokens, startIndex + 1);
  let alternate: TemplateNode[] = [];
  let nextIndex = body.nextIndex;

  if (body.stopTag === "else") {
    const elseTag = tokens[body.nextIndex]?.tag ?? "";
    const elseIfMatch = /^else\s+if\s+([\s\S]+)$/.exec(elseTag);
    if (elseIfMatch) {
      const nested = parseBranch(
        tokens,
        body.nextIndex,
        "if",
        elseIfMatch[1],
      );
      alternate = [nested.node];
      nextIndex = nested.nextIndex;
    } else {
      const alternateResult = parseNodes(tokens, body.nextIndex + 1);
      alternate = alternateResult.nodes;
      nextIndex = alternateResult.nextIndex;
    }
  }

  return {
    node: { kind, expression, children: body.nodes, alternate },
    nextIndex,
  };
}

function readPath(value: unknown, path: string): unknown {
  if (path === "") return value;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && Object.hasOwn(current, key)) return (current as TemplateData)[key];
    return undefined;
  }, value);
}

function resolveExpression(expression: string, root: TemplateData, current: unknown): unknown {
  const trimmed = expression.trim();
  if (trimmed === ".") return current;
  if (trimmed === "$") return root;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "nil") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith('"')) return JSON.parse(trimmed);
  if (trimmed.startsWith("$.")) return readPath(root, trimmed.slice(2));
  if (trimmed.startsWith(".")) return readPath(current, trimmed.slice(1));
  return readPath(current, trimmed);
}

function isTruthy(value: unknown): boolean {
  if (value == null || value === false || value === "" || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Map || value instanceof Set) return value.size > 0;
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) return Object.keys(value).length > 0;
  }
  return true;
}

function renderNodes(nodes: TemplateNode[], root: TemplateData, current: unknown): string {
  return nodes.map((node) => {
    if (node.kind === "text") return node.value;
    if (node.kind === "expression") {
      const value = resolveExpression(node.expression, root, current);
      return value == null ? "" : esc(String(value)).replaceAll("'", "&#39;");
    }
    const value = resolveExpression(node.expression, root, current);
    if (node.kind === "range") {
      const items = Array.isArray(value)
        ? value
        : value && typeof value === "object"
          ? Object.keys(value).sort().map((key) => (value as TemplateData)[key])
          : [];
      return items.length > 0
        ? items.map((item) => renderNodes(node.children, root, item)).join("")
        : renderNodes(node.alternate, root, current);
    }
    if (!isTruthy(value)) {
      return renderNodes(node.alternate, root, current);
    }

    // `with` changes the dot context for its children; `if` keeps the
    // surrounding context so `{{if .customer}}{{.customer_name}}{{end}}`
    // continues to resolve fields from the root data object.
    const childContext = node.kind === "with" ? value : current;
    return renderNodes(node.children, root, childContext);
  }).join("");
}

/** Basic paths and control statements; unsupported input is preserved in full. */
export const defaultTemplateEngine: TemplateEngine = Object.freeze<TemplateEngine>({
  render(template, data) {
    const tokens = tokenize(template);
    if (!supportsTokens(tokens)) return template;
    return renderNodes(parseNodes(tokens, 0).nodes, data, data);
  },
});
