import { explicitStyleControl } from "../i18n/style-control-metadata";
import { createBlockPlugin } from "./create-block-plugin";
import type { BlockPlugin, BlockPluginOptions, ControlSchema } from "./types";

/** 集成方显式声明的文案归集成方管理，其余归一化使用公共流程。 */
export function defineBlock<Schema extends ControlSchema, const Type extends string>(input: BlockPluginOptions<Schema, Type>): BlockPlugin<Schema, Type> {
  return createBlockPlugin({ ...input, styleControls: input.styleControls?.map(explicitStyleControl) });
}
