import { STYLE_GROUPS } from "../constants/style-groups";
import { BlockIcon } from "../components/BlockIcon";
import { readStyleValue } from "../utils/style";
import { FieldControl } from "./FieldControl";
import { StyleControl } from "./StyleControl";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailBlockNode } from "../types/document";

interface InspectorFieldsProps {
  block: EmailBlockNode;
  definition: BlockDefinition;
  variables: Variable[];
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function InspectorFields({
  block,
  definition,
  variables,
  onCommitField,
  onCommitStyle,
}: InspectorFieldsProps) {
  const contentFields = definition.fields ?? [];
  const styleFields = definition.styleFields ?? [];
  const grouped = STYLE_GROUPS.map((group) => ({
    group,
    fields: styleFields.filter((field) => field.group === group.group),
  })).filter((group) => group.fields.length > 0);

  return (
    <div className="ree-inspector">
      <div className="ree-inspector-head">
        <BlockIcon icon={definition.icon} className="ree-inspector-icon" />
        <span className="ree-inspector-title">{definition.title}</span>
      </div>

      {contentFields.length > 0 ? (
        <section className="ree-inspector-section">
          <div className="ree-inspector-section-title">Content</div>
          {contentFields.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              value={block.fields[field.name]}
              variables={variables}
              onChange={(value) => onCommitField(block.id, field.name, value)}
            />
          ))}
        </section>
      ) : null}

      {definition.inlineEdit ? (
        <section className="ree-inspector-section">
          <div className="ree-inspector-hint">
            Edit content inline on the canvas
          </div>
        </section>
      ) : null}

      {grouped.map(({ group, fields }) => (
        <section key={group.group} className="ree-inspector-section">
          <div className="ree-inspector-section-title">{group.label}</div>
          {fields.map((field) => (
            <StyleControl
              key={field.id}
              config={field}
              value={readStyleValue(block.style, field.id)}
              onChange={(value) => onCommitStyle(block.id, field.id, value)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
