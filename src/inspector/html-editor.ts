import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  HighlightStyle,
  LRLanguage,
  LanguageSupport,
  bracketMatching,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { parser as htmlParser } from "@lezer/html";
import { EditorState, type Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";

const htmlLanguage = LRLanguage.define({
  name: "html",
  parser: htmlParser.configure({ dialect: "selfClosing" }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
  },
});

const htmlHighlightStyle = HighlightStyle.define([
  { tag: tags.content, color: "#1f2328" },
  { tag: tags.comment, color: "#6e7781", fontStyle: "italic" },
  { tag: tags.string, color: "#0a3069" },
  { tag: tags.documentMeta, color: "#8250df" },
  { tag: tags.processingInstruction, color: "#8250df" },
  { tag: tags.angleBracket, color: "#6e7781" },
  { tag: tags.tagName, color: "#116329" },
  { tag: tags.attributeName, color: "#0550ae" },
  { tag: tags.definitionOperator, color: "#6e7781" },
  { tag: tags.attributeValue, color: "#0a3069" },
  { tag: tags.character, color: "#0550ae" },
  { tag: tags.invalid, color: "#cf222e" },
]);

const htmlEditorTheme = EditorView.theme(
  {
    "&": {
      color: "#1f2328",
      backgroundColor: "#f6f8fa",
      fontSize: "13px",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      lineHeight: "1.55",
    },
    ".cm-content": {
      padding: "8px 0",
      caretColor: "#1f2328",
    },
    ".cm-line": {
      padding: "0 12px",
    },
    ".cm-gutters": {
      backgroundColor: "#f6f8fa",
      color: "#8c959f",
      borderRight: "1px solid #e3e3e5",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(9, 105, 218, 0.06)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(9, 105, 218, 0.08)",
      color: "#1f2328",
    },
    ".cm-placeholder": {
      color: "#8c959f",
    },
  },
  { dark: false },
);

const templateDecoration = Decoration.mark({ class: "ree-cm-template" });

const templateMatcher = new MatchDecorator({
  regexp: /\{\{[^{}]*\}\}/g,
  decoration: templateDecoration,
});

const templateHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = templateMatcher.createDeco(view);
    }

    update(update: ViewUpdate) {
      this.decorations = templateMatcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

export function createHtmlEditorExtensions(
  placeholderText: string,
  onChange: (value: string) => void,
): Extension[] {
  return [
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    drawSelection(),
    highlightSpecialChars(),
    history(),
    indentOnInput(),
    bracketMatching(),
    EditorState.tabSize.of(2),
    indentUnit.of("  "),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({
      spellcheck: "false",
      autocapitalize: "off",
      autocorrect: "off",
      "aria-label": "HTML",
    }),
    htmlEditorTheme,
    syntaxHighlighting(htmlHighlightStyle),
    templateHighlight,
    new LanguageSupport(htmlLanguage),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    placeholderText ? placeholder(placeholderText) : [],
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChange(update.state.doc.toString());
    }),
  ];
}
