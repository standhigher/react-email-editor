/** Preview values; document data should contain structured-cloneable values. */
export interface TemplateData {
  [key: string]: unknown;
}

/** Optional diagnostic returned by a consumer's template validator. */
export interface TemplateValidationIssue {
  message: string;
  /** Zero-based character offset in the original template. */
  offset?: number;
}

/** Synchronous template adapter; owns expression semantics and HTML escaping. */
export interface TemplateEngine {
  /** Receives the complete template and detached data; errors propagate. */
  render: (template: string, data: TemplateData) => string;
  /** Optional, explicitly invoked; never blocks saving or rendering automatically. */
  validate?: (template: string) => TemplateValidationIssue[];
}

/** Shared engine selection for standalone rendering and validation. */
export interface TemplateEngineOptions {
  /** Defaults to the built-in basic engine. */
  templateEngine?: TemplateEngine;
}
