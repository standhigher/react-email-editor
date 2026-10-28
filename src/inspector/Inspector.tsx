import { BodyFields } from "./BodyFields";
import { InspectorFields } from "./InspectorFields";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";

export type InspectorPanel = "body" | "block";

interface InspectorProps {
  panel: InspectorPanel;
  body: EmailBodySettings;
  block: EmailBlockNode | null;
  definition: BlockDefinition | undefined;
  variables: Variable[];
  onPanelChange: (panel: InspectorPanel) => void;
  onCommitBody: (patch: Partial<EmailBodySettings>) => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function Inspector({
  panel,
  body,
  block,
  definition,
  variables,
  onPanelChange,
  onCommitBody,
  onCommitField,
  onCommitStyle,
}: InspectorProps) {
  const showBlock = panel === "block" && block && definition;

  return (
    <aside className="ree-col ree-col-right">
      <div className="ree-col-head ree-inspector-bar">
        <div className="ree-inspector-tabs" role="group" aria-label="Inspector panel">
          <button
            type="button"
            className={`ree-inspector-tab${panel === "body" ? " is-active" : ""}`}
            aria-pressed={panel === "body"}
            onClick={() => onPanelChange("body")}
          >
            BODY
          </button>
          {block && definition ? (
            <button
              type="button"
              className={`ree-inspector-tab${showBlock ? " is-active" : ""}`}
              aria-pressed={Boolean(showBlock)}
              onClick={() => onPanelChange("block")}
            >
              BLOCK
            </button>
          ) : null}
        </div>
      </div>
      <div className="ree-inspector-scroll">
        {showBlock ? (
          <InspectorFields
            block={block}
            body={body}
            definition={definition}
            variables={variables}
            onCommitField={onCommitField}
            onCommitStyle={onCommitStyle}
          />
        ) : (
          <BodyFields body={body} onChange={onCommitBody} />
        )}
      </div>
    </aside>
  );
}
