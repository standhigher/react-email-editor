import { buildRenderContext } from "../render/context";
import { useId } from "react";
import { PluginEditorContext } from "../plugins/editor-context";
import { BlockErrorBoundary } from "../plugins/components/BlockErrorBoundary";
import { STYLE_GROUPS } from "../constants/style-groups";
import { BlockIcon } from "../components/BlockIcon";
import { inheritedStyleValue, styleReset } from "./utils";
import { readStyleValue } from "../utils/style";
import { ControlRenderer } from "./ControlRenderer";
import { InspectorSection } from "./components/InspectorSection";
import { StyleControlStack } from "./components/StyleControlStack";
import { StyleControl } from "./StyleControl";
import type { BlockDefinition, BlockInspectorSection, StyleControlConfig, Variable } from "../types/block";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";

interface InspectorControlsProps {
  block: EmailBlockNode;
  body: EmailBodySettings;
  definition: BlockDefinition;
  variables: Variable[];
  onCommitControl: (id: string, name: string, value: unknown) => void;
  onCommitControls: (id: string, patch: Record<string, unknown>) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}

export function InspectorControls({
  block,
  body,
  definition,
  variables,
  onCommitControl,
  onCommitControls,
  onCommitStyle,
}: InspectorControlsProps) {
  const toolbarId = useId();
  const contentControls = (definition.controls ?? []).filter((control) => control.name !== definition.inlineControl);
  const CustomInspector = definition.inspector;
  const context = buildRenderContext(block, "canvas", body, definition);
  const controlValues = context.controls;
  const pluginProps = { ...context, variables: structuredClone(variables), selected: true, renderedHtml: "", select: () => {}, setControl: (name: string, value: unknown) => onCommitControl(block.id, name, value), setControls: (patch: Record<string, unknown>) => onCommitControls(block.id, patch), setStyle: (id: string, value: string) => onCommitStyle(block.id, id, value) };
  const styleControls = definition.styleControls ?? [];
  const renderStyle = (control: StyleControlConfig) => {
    const stored = readStyleValue(block.style, control.id);
    const inherited = inheritedStyleValue(control.id, body);
    const restore = readStyleValue(definition.defaultStyle, control.id) || control.defaultValue || "";
    const reset = styleReset(stored, restore, inherited !== undefined);
    return (
      <StyleControl
        key={control.id}
        config={control}
        value={stored}
        fallback={inherited}
        resetTo={reset.resetTo}
        showReset={reset.show}
        resetLabel={inherited !== undefined ? "Use default" : "Reset"}
        onChange={(value) => onCommitStyle(block.id, control.id, value)}
      />
    );
  };
  const sections: BlockInspectorSection[] = definition.inspectorSections ?? STYLE_GROUPS.map((group) => ({
    title: group.label,
    controlNames: group.group === "general" && !CustomInspector ? contentControls.map((control) => control.name) : [],
    styleIds: styleControls.filter((control) => control.group === group.group).map((control) => control.id),
  }));
  const resolveStyles = (ids: string[] = []) => ids.flatMap((id) => {
    const control = styleControls.find((item) => item.id === id);
    return control ? [control] : [];
  });

  return (
    <div className="ree-inspector">
      <div className="ree-inspector-head">
        <BlockIcon icon={definition.icon} className="ree-inspector-icon" />
        <span className="ree-inspector-title">{definition.title}</span>
      </div>

      <BlockErrorBoundary identity={block}>
      <PluginEditorContext.Provider value={{ ...pluginProps, toolbarId, toolbarCollapsed: false, controlDefinitions: definition.controls ?? [], profiles: Object.fromEntries((definition.controls ?? []).map((control) => [control.name, control.profile])) }}>
      {CustomInspector ? <CustomInspector {...pluginProps} /> : null}
      {sections.map((section) => {
        const controls = (section.controlNames ?? []).flatMap((name) => {
          const control = CustomInspector ? undefined : contentControls.find((item) => item.name === name);
          return control ? [control] : [];
        });
        const styles = resolveStyles(section.styleIds);
        const advanced = resolveStyles(section.advancedStyleIds);
        if (!controls.length && !styles.length && !advanced.length) return null;
        return (
          <InspectorSection key={`${block.type}-${section.title}`} title={section.title}>
            {controls.map((control) => (
              <ControlRenderer
                key={control.name}
                control={control}
                value={controlValues[control.name]}
                body={body}
                variables={variables}
                onChange={(value) => onCommitControl(block.id, control.name, value)}
              />
            ))}
            <StyleControlStack controls={styles} renderControl={renderStyle} />
            {advanced.length ? (
              <details className="ree-inspector-advanced">
                <summary>Advanced block border</summary>
                <div className="ree-inspector-section-body">
                  <StyleControlStack controls={advanced} renderControl={renderStyle} />
                </div>
              </details>
            ) : null}
          </InspectorSection>
        );
      })}
      </PluginEditorContext.Provider>
      </BlockErrorBoundary>
    </div>
  );
}
