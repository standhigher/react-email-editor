import { validateControls } from "./validation";
import { bindPluginComponent } from "./components/bind-plugin-component";
import { WRAPPER_STYLE_CONTROLS } from "../blocks/style-controls";
import { createEmailTools, emailMarkup } from "./email-tools";
import { readControlValues } from "./controls";
import { snapshotConfig } from "./config-snapshot";
import type { BlockPlugin, BlockPluginOptions, ControlSchema, ControlValues } from "./types";

export function defineBlock<Schema extends ControlSchema, const Type extends string>(input: BlockPluginOptions<Schema, Type>): BlockPlugin<Schema, Type> {
  const options = snapshotConfig(input);
  if (!options.type.trim() || !options.title.trim()) throw new Error("Block type and title are required.");
  const schema = options.controls ?? {} as Schema;
  const readControls = (source: Record<string, unknown>) => {
    const snapshot = structuredClone(source);
    return { ...snapshot, ...readControlValues(schema, snapshot) };
  };
  const container = options.containerStyles;
  const standard = container === false ? [] : WRAPPER_STYLE_CONTROLS.filter((item) => item.group === "dimension" ? container === undefined || container === true || container.spacing !== false : container === undefined || container === true || container.appearance !== false);
  const styles = new Map(standard.map((item) => [item.id, item]));
  for (const item of options.styleControls ?? []) styles.set(item.id, item);
  const inline = Object.entries(schema).filter(([, spec]) => spec.kind === "richText" && spec.inline);
  if (inline.length > 1 && !options.Canvas) throw new Error(`${options.type}: multiple inline controls require a Canvas component.`);
  return snapshotConfig({
    type: options.type, title: options.title, description: options.description, icon: options.icon,
    override: options.override, schema,
    controls: Object.entries(schema).map(([name, spec]) => ({ ...spec, name })),
    readControls,
    styleControls: [...styles.values()],
    inspectorSections: options.inspectorSections,
    defaultStyle: options.defaultStyle, defaultData: options.defaultData,
    inlineControl: options.Canvas ? undefined : inline[0]?.[0],
    canvas: bindPluginComponent(options.Canvas), inspector: bindPluginComponent(options.Inspector),
    renderEmail: (ctx) => {
      const controls = ctx.controls as ControlValues<Schema>;
      if (ctx.mode === "email") validateControls(schema, controls);
      return emailMarkup(options.renderEmail({ ...ctx, controls, email: createEmailTools(ctx.body) }));
    },
  });
}
