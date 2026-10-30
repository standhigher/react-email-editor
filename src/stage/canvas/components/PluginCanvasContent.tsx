import { useEditorTranslation } from "../../../i18n/context";
import { typographyCss } from "../../../utils/style";
import { useMemo } from "react";
import { buildRenderContext } from "../../../render/context";
import { renderBlockContentFromContext, mergeTemplateData } from "../../../render/block-html";
import { PluginEditorContext } from "../../../plugins/editor-context";
import { EditableRichText } from "../../../plugins/components/EditableRichText";
import { HtmlCanvas } from "./HtmlCanvas";
import type { BlockDefinition, Variable } from "../../../types/block";
import type { TemplateEngine } from "../../../types/template";
import type { EmailBlockNode, EmailBodySettings } from "../../../types/document";

interface PluginCanvasContentProps {
  block: EmailBlockNode;
  body: EmailBodySettings;
  definition: BlockDefinition | undefined;
  variables: Variable[];
  templateEngine: TemplateEngine;
  selected: boolean;
  toolbarId: string;
  toolbarCollapsed: boolean;
  select: () => void;
  onCommitControl: (id: string, name: string, value: unknown) => void;
  onCommitControls: (id: string, patch: Record<string, unknown>) => void;
  onCommitStyle: (id: string, name: string, value: string) => void;
}

export function PluginCanvasContent({ block, body, definition, variables, templateEngine, selected, toolbarId, toolbarCollapsed, select, onCommitControl, onCommitControls, onCommitStyle }: PluginCanvasContentProps) {
  const t = useEditorTranslation();
  const variableSnapshot = useMemo(() => structuredClone(variables), [variables]);
  const context = useMemo(() => definition ? buildRenderContext(block, "canvas", body, definition) : null, [block, body, definition]);
  const renderedHtml = useMemo(() => definition && context ? renderBlockContentFromContext(context, definition, {
    resolveHtmlTemplate: true, templateEngine, variables, templateData: mergeTemplateData(variables, block.defaultData), body,
  }) : "", [block.defaultData, body, context, definition, variables, templateEngine]);
  if (!definition || !context) return <div className="ree-plugin-error" role="alert">{t("editor.missingPlugin", { type: block.type })}</div>;
  const props = {
    ...context, variables: variableSnapshot, selected, renderedHtml, select,
    setControl: (name: string, value: unknown) => onCommitControl(block.id, name, value), setControls: (patch: Record<string, unknown>) => onCommitControls(block.id, patch),
    setStyle: (name: string, value: string) => onCommitStyle(block.id, name, value),
  };
  const Canvas = definition.canvas;
  return (
    <PluginEditorContext.Provider value={{ ...props, toolbarId, toolbarCollapsed, controlDefinitions: definition.controls ?? [], profiles: Object.fromEntries((definition.controls ?? []).map((control) => [control.name, control.profile])) }}>
      {Canvas ? <Canvas {...props} /> : definition.inlineControl ? <EditableRichText control={definition.inlineControl} /> : <HtmlCanvas html={renderedHtml} baseCss={typographyCss(context.style, body)} onSelect={select} />}
    </PluginEditorContext.Provider>
  );
}
