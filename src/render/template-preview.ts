interface TemplateData {
  [key: string]: unknown;
}

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

const TOKEN_PATTERN = /\{\{-?([\s\S]*?)-?\}\}/g;

function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  for (const match of template.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) tokens.push({ text: template.slice(lastIndex, index) });
    tokens.push({ tag: match[1].trim() });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < template.length) tokens.push({ text: template.slice(lastIndex) });
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
    if (tag === "else" || tag.startsWith("else if ")) {
      return { nodes, nextIndex: index, stopTag: "else" };
    }
    if (tag === "end") return { nodes, nextIndex: index, stopTag: "end" };

    const branchMatch = /^(if|range|with)\s+(.+)$/.exec(tag);
    if (branchMatch) {
      const body = parseNodes(tokens, index + 1);
      let alternate: TemplateNode[] = [];
      let nextIndex = body.nextIndex;
      if (body.stopTag === "else") {
        const alternateResult = parseNodes(tokens, body.nextIndex + 1);
        alternate = alternateResult.nodes;
        nextIndex = alternateResult.nextIndex;
      }
      nodes.push({
        kind: branchMatch[1] as BranchNode["kind"],
        expression: branchMatch[2],
        children: body.nodes,
        alternate,
      });
      index = nextIndex + (tokens[nextIndex]?.tag === "end" ? 1 : 0);
      continue;
    }

    nodes.push({ kind: "expression", expression: tag });
    index += 1;
  }
  return { nodes, nextIndex: index };
}

function readPath(value: unknown, path: string): unknown {
  if (path === "") return value;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") return (current as TemplateData)[key];
    return undefined;
  }, value);
}

function resolveExpression(expression: string, root: TemplateData, current: unknown): unknown {
  const trimmed = expression.trim();
  if (trimmed === ".") return current;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "nil") return null;
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("$.")) return readPath(root, trimmed.slice(2));
  if (trimmed.startsWith(".")) return readPath(current, trimmed.slice(1));
  return readPath(current, trimmed);
}

function isTruthy(value: unknown): boolean {
  if (value == null || value === false || value === "" || value === 0) return false;
  return !Array.isArray(value) || value.length > 0;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderNodes(nodes: TemplateNode[], root: TemplateData, current: unknown): string {
  return nodes.map((node) => {
    if (node.kind === "text") return node.value;
    if (node.kind === "expression") {
      const value = resolveExpression(node.expression, root, current);
      return value == null ? "" : escapeHtml(String(value));
    }
    const value = resolveExpression(node.expression, root, current);
    if (node.kind === "range") {
      const items = Array.isArray(value)
        ? value
        : value && typeof value === "object"
          ? Object.values(value)
          : [];
      return items.map((item) => renderNodes(node.children, root, item)).join("");
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

/** Uses block sample data only for the canvas; email output keeps the template. */
export function renderTemplatePreview(
  html: string,
  defaultData?: TemplateData,
): string {
  if (defaultData === undefined) return html;
  return renderNodes(parseNodes(tokenize(html), 0).nodes, defaultData, defaultData);
}
