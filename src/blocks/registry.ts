import type { BlockDefinition } from "../types/block";
import { buttonBlock } from "./button";
import { dividerBlock } from "./divider";
import { headingBlock } from "./heading";
import { htmlBlock } from "./html";
import { imageBlock } from "./image";
import { spacerBlock } from "./spacer";
import { textBlock } from "./text";

export const DEFAULT_BLOCKS: BlockDefinition[] = [
  headingBlock,
  textBlock,
  buttonBlock,
  imageBlock,
  dividerBlock,
  spacerBlock,
  htmlBlock,
];
