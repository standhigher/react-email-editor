import { useContext } from "react";
import { RichText } from "../../stage/rich-text/RichText";
import { typographyStyle } from "../../utils/style";
import { contentDefaults } from "../../render/content-style";
import { usePluginEditor, RichTextFocusContext } from "../editor-context";
import type { RichTextProfile } from "../../types/block";

export interface EditableRichTextProps {
  control: string;
  profile?: RichTextProfile;
  placeholder?: string;
}

export function EditableRichText({ control, profile, placeholder }: EditableRichTextProps) {
  const context = usePluginEditor();
  const focus = useContext(RichTextFocusContext);
  const activate = (id: string) => { focus.activate(id); context.select(); };
  const definition = context.controlDefinitions.find((item) => item.name === control);
  if (definition?.kind !== "richText") throw new Error(`EditableRichText requires a richText control: ${control}`);
  const identity = `${context.toolbarId}-${control}`;
  const typography = typographyStyle(context.style, context.body);
  const defaults = contentDefaults(context.style, context.body);
  return (
    <RichText
      initialHtml={String(context.controls[control] ?? "")}
      profile={profile ?? context.profiles[control]}
      placeholder={placeholder}
      variables={context.variables}
      selected={context.selected && focus.active === identity}
      toolbarId={context.toolbarId}
      toolbarCollapsed={context.toolbarCollapsed}
      onSelect={() => activate(identity)}
      onCommit={(html) => context.setControl(control, html)}
      inherited={{
        fontFamily: String(typography.fontFamily), fontSize: String(typography.fontSize),
        color: String(typography.color), fontWeight: context.style.typography?.fontWeight ?? context.body.fontWeight,
        lineHeight: String(typography.lineHeight), paragraphSpacing: defaults.paragraph,
        listSpacing: defaults.listSpacing, listIndent: defaults.listIndent,
        linkColor: defaults.linkColor, linkDecoration: defaults.linkDecoration,
      }}
    />
  );
}
