import { InspectorFields } from "./InspectorFields";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailBlockNode } from "../types/document";

interface InspectorProps {
  block: EmailBlockNode | null;
  definition: BlockDefinition | undefined;
  variables: Variable[];
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function Inspector({
  block,
  definition,
  variables,
  onCommitField,
  onCommitStyle,
}: InspectorProps) {
  return (
    <aside className="ree-col ree-col-right">
      <div className="ree-col-head">Inspector</div>
      <div className="ree-inspector-scroll">
        {block && definition ? (
          <InspectorFields
            block={block}
            definition={definition}
            variables={variables}
            onCommitField={onCommitField}
            onCommitStyle={onCommitStyle}
          />
        ) : (
          <div className="ree-inspector-empty">
            Select a block on the canvas to edit
          </div>
        )}
      </div>
    </aside>
  );
}
