import color from "./pt-PT/color.json" with { type: "json" };
import editor from "./pt-PT/editor.json" with { type: "json" };
import preview from "./pt-PT/preview.json" with { type: "json" };
import common from "./pt-PT/common.json" with { type: "json" };
import toolbar from "./pt-PT/toolbar.json" with { type: "json" };
import inspector from "./pt-PT/inspector.json" with { type: "json" };
import dnd from "./pt-PT/dnd.json" with { type: "json" };
import blocks from "./pt-PT/blocks.json" with { type: "json" };
import type { Messages } from "../types";

const messages = { color, editor, preview, common, toolbar, inspector, dnd, blocks } satisfies Messages;

export default messages;
