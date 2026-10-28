import { STYLE_GROUPS } from "../constants/style-groups";
import { BlockIcon } from "../components/BlockIcon";
import { inheritedStyleValue, styleReset } from "./utils";
import { readStyleValue } from "../utils/style";
import { FieldControl } from "./FieldControl";
import { InspectorSection } from "./components/InspectorSection";
import { StyleFieldStack } from "./components/StyleFieldStack";
import { StyleControl } from "./StyleControl";
import type { BlockDefinition, BlockInspectorSection, StyleFieldConfig, Variable } from "../types/block";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";

interface InspectorFieldsProps {
  block: EmailBlockNode;
  body: EmailBodySettings;
  definition: BlockDefinition;
  variables: Variable[];
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function InspectorFields({
  block,
  body,
  definition,
  variables,
  onCommitField,
  onCommitStyle,
}: InspectorFieldsProps) {
  const contentFields = definition.fields ?? [];
  const styleFields = definition.styleFields ?? [];
  const renderStyle = (field: StyleFieldConfig) => {
    const stored = readStyleValue(block.style, field.id);
    const inherited = inheritedStyleValue(field.id, body);
    const restore = readStyleValue(definition.defaultStyle, field.id) || field.defaultValue || "";
    const reset = styleReset(stored, restore, inherited !== undefined);
    return (
      <StyleControl
        key={field.id}
        config={field}
        value={stored}
        fallback={inherited}
        resetTo={reset.resetTo}
        showReset={reset.show}
        resetLabel={inherited !== undefined ? "Use default" : "Reset"}
        onChange={(value) => onCommitStyle(block.id, field.id, value)}
      />
    );
  };
  const sections: BlockInspectorSection[] = definition.inspectorSections ?? STYLE_GROUPS.map((group) => ({
    title: group.label,
    fieldNames: group.group === "general" ? contentFields.map((field) => field.name) : [],
    styleIds: styleFields.filter((field) => field.group === group.group).map((field) => field.id),
  }));
  const resolveStyles = (ids: string[] = []) => ids.flatMap((id) => {
    const field = styleFields.find((item) => item.id === id);
    return field ? [field] : [];
  });

  return (
    <div className="ree-inspector">
      <div className="ree-inspector-head">
        <BlockIcon icon={definition.icon} className="ree-inspector-icon" />
        <span className="ree-inspector-title">{definition.title}</span>
      </div>

      {sections.map((section) => {
        const fields = (section.fieldNames ?? []).flatMap((name) => {
          const field = contentFields.find((item) => item.name === name);
          return field ? [field] : [];
        });
        const styles = resolveStyles(section.styleIds);
        const advanced = resolveStyles(section.advancedStyleIds);
        if (!fields.length && !styles.length && !advanced.length) return null;
        return (
          <InspectorSection key={`${block.type}-${section.title}`} title={section.title}>
            {fields.map((field) => (
              <FieldControl
                key={field.name}
                field={field}
                value={block.fields[field.name]}
                variables={variables}
                onChange={(value) => onCommitField(block.id, field.name, value)}
              />
            ))}
            <StyleFieldStack fields={styles} renderField={renderStyle} />
            {advanced.length ? (
              <details className="ree-inspector-advanced">
                <summary>Advanced block border</summary>
                <div className="ree-inspector-section-body">
                  <StyleFieldStack fields={advanced} renderField={renderStyle} />
                </div>
              </details>
            ) : null}
          </InspectorSection>
        );
      })}
    </div>
  );
}
