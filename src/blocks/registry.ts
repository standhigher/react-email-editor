import type { BlockPlugin } from "../plugins/types";
import { buttonBlock } from "./button";
import { dividerBlock } from "./divider";
import { headingBlock } from "./heading";
import { htmlBlock } from "./html";
import { imageBlock } from "./image";
import { spacerBlock } from "./spacer";
import { textBlock } from "./text";

export const DEFAULT_BLOCKS: BlockPlugin[] = [
  headingBlock,
  textBlock,
  buttonBlock,
  imageBlock,
  dividerBlock,
  spacerBlock,
  htmlBlock,
];
