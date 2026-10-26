import { GlobalFields } from "./GlobalFields";
import { InspectorFields } from "./InspectorFields";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../types/document";

export type InspectorPanel = "global" | "block";

interface InspectorProps {
  panel: InspectorPanel;
  global: EmailGlobalSettings;
  block: EmailBlockNode | null;
  definition: BlockDefinition | undefined;
  variables: Variable[];
  onPanelChange: (panel: InspectorPanel) => void;
  onCommitGlobal: (patch: Partial<EmailGlobalSettings>) => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function Inspector({
  panel,
  global,
  block,
  definition,
  variables,
  onPanelChange,
  onCommitGlobal,
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
            className={`ree-inspector-tab${panel === "global" ? " is-active" : ""}`}
            aria-pressed={panel === "global"}
            onClick={() => onPanelChange("global")}
          >
            GLOBAL
          </button>
          <button
            type="button"
            className={`ree-inspector-tab${showBlock ? " is-active" : ""}`}
            aria-pressed={Boolean(showBlock)}
            disabled={!block || !definition}
            onClick={() => onPanelChange("block")}
          >
            BLOCK
          </button>
        </div>
      </div>
      <div className="ree-inspector-scroll">
        {showBlock ? (
          <InspectorFields
            block={block}
            definition={definition}
            variables={variables}
            global={global}
            onCommitField={onCommitField}
            onCommitStyle={onCommitStyle}
          />
        ) : (
          <GlobalFields global={global} onChange={onCommitGlobal} />
        )}
      </div>
    </aside>
  );
}
