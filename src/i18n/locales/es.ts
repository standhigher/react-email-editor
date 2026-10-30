import color from "./es/color.json" with { type: "json" };
import editor from "./es/editor.json" with { type: "json" };
import preview from "./es/preview.json" with { type: "json" };
import common from "./es/common.json" with { type: "json" };
import toolbar from "./es/toolbar.json" with { type: "json" };
import inspector from "./es/inspector.json" with { type: "json" };
import dnd from "./es/dnd.json" with { type: "json" };
import blocks from "./es/blocks.json" with { type: "json" };
import type { Messages } from "../types";

const messages = { color, editor, preview, common, toolbar, inspector, dnd, blocks } satisfies Messages;

export default messages;
