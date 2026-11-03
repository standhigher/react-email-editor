import type { MessageKey } from "./types";

interface BlockMessageKeys {
  title: MessageKey;
  description: MessageKey;
}

export const BODY_STYLE_KEYS: Partial<Record<string, MessageKey>> = {
  "textColor": "common.textColor",
  "linkColor": "common.linkColor",
  "fontFamily": "common.fontFamily",
  "fontWeight": "common.fontWeight",
  "backgroundColor": "common.background",
  "contentWidth": "inspector.contentWidth",
  "contentPadding": "common.padding",
  "blockGap": "inspector.blockGap",
  "borderColor": "common.borderColor",
  "borderWidth": "common.borderWidth",
  "borderStyle": "common.borderStyle"
};

export const CONTROL_KEYS: Partial<Record<string, MessageKey>> = {
  "html": "common.content",
  "href": "common.link",
  "src": "inspector.imageUrl",
  "link": "common.link",
  "height": "common.height"
};

export const SECTION_KEYS: Partial<Record<string, MessageKey>> = {
  "spacing": "inspector.spacing",
  "blockAppearance": "inspector.blockAppearance",
  "link": "common.link",
  "button": "blocks.button.title",
  "image": "blocks.image.title",
  "sizePosition": "inspector.sizePosition",
  "imageAppearance": "inspector.imageAppearance",
  "line": "inspector.line",
  "spacer": "blocks.spacer.title",
  "html": "blocks.html.title",
  "general": "common.general",
  "content": "common.content"
};

export const GROUP_KEYS: Partial<Record<string, MessageKey>> = {
  "general": "common.general",
  "dimension": "inspector.spacing",
  "typography": "inspector.typography",
  "decorations": "inspector.decoration"
};

export const OPTION_KEYS: Partial<Record<string, MessageKey>> = {
  "none": "common.none",
  "solid": "common.solid",
  "dashed": "common.dashed",
  "dotted": "common.dotted",
  "": "common.default",
  "normal": "common.regular",
  "bold": "common.bold"
};

export const BLOCK_KEYS: Partial<Record<string, BlockMessageKeys>> = {
  "heading": {
    "title": "blocks.heading.title",
    "description": "blocks.heading.description"
  },
  "text": {
    "title": "blocks.text.title",
    "description": "blocks.text.description"
  },
  "button": {
    "title": "blocks.button.title",
    "description": "blocks.button.description"
  },
  "image": {
    "title": "blocks.image.title",
    "description": "blocks.image.description"
  },
  "divider": {
    "title": "blocks.divider.title",
    "description": "blocks.divider.description"
  },
  "spacer": {
    "title": "blocks.spacer.title",
    "description": "blocks.spacer.description"
  },
  "html": {
    "title": "blocks.html.title",
    "description": "blocks.html.description"
  }
};
