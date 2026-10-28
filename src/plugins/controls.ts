import { createElement } from "react";
import { snapshotValue } from "../utils/snapshot";
import { controlConstraintError } from "./control-validation";
import type { ControlDefinition, ControlKind, ControlOptions, ControlSchema, ControlValues } from "./types";

function buildControl<T>(kind: ControlKind, options: ControlOptions<T>, fallback: T, parse: (value: unknown) => T): ControlDefinition<T> {
  const { component: Component, validate, ...config } = snapshotValue(options);
  const defaultValue = structuredClone(config.defaultValue ?? fallback);
  const read = (value: unknown): T => value === undefined ? structuredClone(defaultValue) : parse(value);
  return snapshotValue({
    ...config, kind, defaultValue, read,
    validateValue: (value: unknown) => controlConstraintError(kind, config, value) ?? validate?.(value as T),
    renderControl: Component ? (props) => createElement(Component, { ...props, value: props.value as T }) : undefined,
  } satisfies ControlDefinition<T>);
}

function textControl(kind: ControlKind, options: ControlOptions<string>): ControlDefinition<string> {
  return buildControl(kind, options, "", (value) => value == null ? "" : String(value));
}

export function readControlValues<Schema extends ControlSchema>(schema: Schema, source: Record<string, unknown>): ControlValues<Schema> {
  // 每个字段的 read 是该字段值类型的唯一运行时入口。
  return { ...source, ...Object.fromEntries(Object.entries(schema).map(([name, spec]) => [name, spec.read(source[name])])) } as ControlValues<Schema>;
}

export const EmailControls = {
  text: (options: ControlOptions<string>) => textControl("text", options),
  textarea: (options: ControlOptions<string>) => textControl("textarea", options),
  richText: (options: ControlOptions<string>) => textControl("richText", { ...options, defaultValue: options.defaultValue ?? "<p></p>" }),
  html: (options: ControlOptions<string>) => textControl("html", options),
  url: (options: ControlOptions<string>) => textControl("url", options),
  image: (options: ControlOptions<string>) => textControl("image", options),
  color: (options: ControlOptions<string>) => textControl("color", options),
  select: (options: ControlOptions<string>) => textControl("select", options),
  boolean: (options: ControlOptions<boolean>) => buildControl("boolean", options, false, (value) => typeof value === "boolean" ? value : false),
  number: (options: ControlOptions<number>) => buildControl("number", options, 0, (value) => {
    return typeof value === "number" || (typeof value === "string" && value.trim()) ? Number(value) : Number.NaN;
  }),
  list<Schema extends ControlSchema>(options: ControlOptions<ControlValues<Schema>[]> & { controls: Schema }): ControlDefinition<ControlValues<Schema>[]> {
    const { controls, ...config } = options;
    const schema = snapshotValue(controls);
    return snapshotValue({ ...buildControl("list", config, [], (value) => Array.isArray(value) ? value.map((item) => readControlValues(schema, item && typeof item === "object" ? item : {})) : []), itemControls: schema });
  },
  custom<T>(options: ControlOptions<T> & { defaultValue: T; read: (value: unknown) => T; component: NonNullable<ControlOptions<T>["component"]> }): ControlDefinition<T> {
    const { read, ...config } = options;
    return buildControl("custom", config, options.defaultValue, read);
  },
};
