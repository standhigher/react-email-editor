import { DEFAULT_BLOCKS } from "../blocks/registry";
import { createBlockNode } from "../document/create-block";
import { documentToHtml } from "../render/document-html";
import { snapshotConfig } from "./config-snapshot";
import { validateDocument } from "./validation";
import type { BlockPlugin, EmailEditorConfig, EmailEditorConfigOptions } from "./types";

export function createEmailEditorConfig(options: EmailEditorConfigOptions = {}): EmailEditorConfig {
  const definitions = new Map<string, BlockPlugin>(DEFAULT_BLOCKS.map((block) => [block.type, block]));
  const customTypes = new Set<string>();
  for (const plugin of options.plugins ?? []) {
    if (customTypes.has(plugin.type)) throw new Error(`Duplicate block plugin: ${plugin.type}`);
    if (definitions.has(plugin.type) && !plugin.override) throw new Error(`Block ${plugin.type} already exists. Set override: true to replace it.`);
    customTypes.add(plugin.type);
    definitions.set(plugin.type, plugin);
  }
  const builtinTypes = new Set(DEFAULT_BLOCKS.map((block) => block.type));
  const visibleBuiltins = options.builtins === false ? [] : options.builtins ?? [...builtinTypes];
  if (new Set(visibleBuiltins).size !== visibleBuiltins.length) throw new Error("Duplicate builtin in library order.");
  for (const type of visibleBuiltins) if (!builtinTypes.has(type)) throw new Error(`Unknown builtin block: ${type}`);
  const all = Object.freeze([...definitions.values()].map((plugin) => snapshotConfig(plugin)));
  const registered = new Map(all.map((plugin) => [plugin.type, plugin]));
  return Object.freeze({
    definitions: all,
    library: Object.freeze([...visibleBuiltins.map((type) => registered.get(type)!), ...(options.plugins ?? []).filter((plugin) => !builtinTypes.has(plugin.type)).map((plugin) => registered.get(plugin.type)!)]),
    pickImage: options.pickImage,
    createBlock: (type: string) => {
      const block = createBlockNode(type, all);
      if (!block) throw new Error(`Unknown block plugin: ${type}`);
      return block;
    },
    toHtml: (document, htmlOptions) => documentToHtml(document, all, htmlOptions),
    validate: (document) => validateDocument(document, all),
  } satisfies EmailEditorConfig);
}

export const DEFAULT_EDITOR_CONFIG = createEmailEditorConfig();
