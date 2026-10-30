import color from "./fr/color.json" with { type: "json" };
import editor from "./fr/editor.json" with { type: "json" };
import preview from "./fr/preview.json" with { type: "json" };
import common from "./fr/common.json" with { type: "json" };
import toolbar from "./fr/toolbar.json" with { type: "json" };
import inspector from "./fr/inspector.json" with { type: "json" };
import dnd from "./fr/dnd.json" with { type: "json" };
import blocks from "./fr/blocks.json" with { type: "json" };
import type { Messages } from "../types";

const messages = { color, editor, preview, common, toolbar, inspector, dnd, blocks } satisfies Messages;

export default messages;
