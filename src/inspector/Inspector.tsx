import { useEditorTranslation } from "../i18n/context";
import { BlockErrorBoundary } from "../plugins/components/BlockErrorBoundary";
import { BodyControls } from "./BodyControls";
import { InspectorControls } from "./InspectorControls";
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
  onCommitControl: (id: string, name: string, value: unknown) => void;
  onCommitControls: (id: string, patch: Record<string, unknown>) => void;
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
  onCommitControl,
  onCommitControls,
  onCommitStyle,
}: InspectorProps) {
  const t = useEditorTranslation();
  const showBlock = panel === "block" && block && definition;

  return (
    <aside className="ree-col ree-col-right">
      <div className="ree-col-head ree-inspector-bar">
        <div className="ree-inspector-tabs" role="group" aria-label={t("inspector.title")}>
          <button
            type="button"
            className={`ree-inspector-tab${panel === "body" ? " is-active" : ""}`}
            aria-pressed={panel === "body"}
            onClick={() => onPanelChange("body")}
          >
            {t("inspector.body")}
          </button>
          {block && definition ? (
            <button
              type="button"
              className={`ree-inspector-tab${showBlock ? " is-active" : ""}`}
              aria-pressed={Boolean(showBlock)}
              onClick={() => onPanelChange("block")}
            >
              {t("inspector.block")}
            </button>
          ) : null}
        </div>
      </div>
      <div className="ree-inspector-scroll">
        {showBlock ? (
          <BlockErrorBoundary identity={block} resetKey={definition}>
          <InspectorControls
            key={block.id}
            block={block}
            body={body}
            definition={definition}
            variables={variables}
            onCommitControl={onCommitControl} onCommitControls={onCommitControls}
            onCommitStyle={onCommitStyle}
          />
          </BlockErrorBoundary>
        ) : (
          <BodyControls body={body} onChange={onCommitBody} />
        )}
      </div>
    </aside>
  );
}
