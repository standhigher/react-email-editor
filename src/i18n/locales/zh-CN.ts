import color from "./zh-CN/color.json" with { type: "json" };
import editor from "./zh-CN/editor.json" with { type: "json" };
import preview from "./zh-CN/preview.json" with { type: "json" };
import common from "./zh-CN/common.json" with { type: "json" };
import toolbar from "./zh-CN/toolbar.json" with { type: "json" };
import inspector from "./zh-CN/inspector.json" with { type: "json" };
import dnd from "./zh-CN/dnd.json" with { type: "json" };
import blocks from "./zh-CN/blocks.json" with { type: "json" };
import type { Messages } from "../types";

const messages = { color, editor, preview, common, toolbar, inspector, dnd, blocks } satisfies Messages;

export default messages;
