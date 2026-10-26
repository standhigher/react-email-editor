import { STYLE_GROUPS } from "../constants/style-groups";
import { BlockIcon } from "../components/BlockIcon";
import { inheritedStyleValue, styleReset } from "./utils";
import { readStyleValue } from "../utils/style";
import { FieldControl } from "./FieldControl";
import { InspectorSection } from "./components/InspectorSection";
import { StyleFieldStack } from "./components/StyleFieldStack";
import { StyleControl } from "./StyleControl";
import type { BlockDefinition, StyleFieldConfig, Variable } from "../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../types/document";

interface InspectorFieldsProps {
  block: EmailBlockNode;
  definition: BlockDefinition;
  variables: Variable[];
  global: EmailGlobalSettings;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function InspectorFields({
  block,
  definition,
  variables,
  global,
  onCommitField,
  onCommitStyle,
}: InspectorFieldsProps) {
  const contentFields = definition.fields ?? [];
  const styleFields = definition.styleFields ?? [];
  const renderStyle = (field: StyleFieldConfig) => {
    const stored = readStyleValue(block.style, field.id);
    const inherited = inheritedStyleValue(field.id, global);
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
        resetLabel={inherited !== undefined ? "Inherit global" : "Reset"}
        onChange={(value) => onCommitStyle(block.id, field.id, value)}
      />
    );
  };
  const sections = STYLE_GROUPS.map((group) => ({
    ...group,
    fields: styleFields.filter((field) => field.group === group.group),
  }));
  const general = sections.find((section) => section.group === "general");
  const showGeneral = contentFields.length > 0 || (general?.fields.length ?? 0) > 0;

  return (
    <div className="ree-inspector">
      <div className="ree-inspector-head">
        <BlockIcon icon={definition.icon} className="ree-inspector-icon" />
        <span className="ree-inspector-title">{definition.title}</span>
      </div>

      {showGeneral ? (
        <InspectorSection title="General">
          {contentFields.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              value={block.fields[field.name]}
              variables={variables}
              onChange={(value) => onCommitField(block.id, field.name, value)}
            />
          ))}
          {general ? <StyleFieldStack fields={general.fields} renderField={renderStyle} /> : null}
        </InspectorSection>
      ) : null}

      {sections.filter((section) => section.group !== "general" && section.fields.length > 0).map((section) => (
        <InspectorSection key={section.group} title={section.label}>
          <StyleFieldStack fields={section.fields} renderField={renderStyle} />
        </InspectorSection>
      ))}
    </div>
  );
}
