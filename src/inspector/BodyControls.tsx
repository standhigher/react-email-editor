import { localizeStyleControl, translateMetadata } from "../i18n/metadata";
import { BODY_STYLE_KEYS, SECTION_KEYS } from "../i18n/metadata-keys";
import { useEditorTranslation } from "../i18n/context";
import { DEFAULT_EMAIL_BODY } from "../document/constants";
import { LINK_DECORATIONS } from "../constants/style-values";
import { CheckboxControl } from "../components/CheckboxControl";
import { resolveEmailBody } from "../document/create-document";
import { BODY_CONTROL_SECTIONS } from "./body-constants";
import { visibleStyleControls } from "./utils";
import { InspectorSection } from "./components/InspectorSection";
import { StyleControlStack } from "./components/StyleControlStack";
import { StyleControl } from "./StyleControl";
import type { StyleControlConfig } from "../types/block";
import type { EmailBodySettings } from "../types/document";

interface BodyControlsProps {
  body: EmailBodySettings;
  onChange: (patch: Partial<EmailBodySettings>) => void;
}

export function BodyControls({ body, onChange }: BodyControlsProps) {
  const t = useEditorTranslation();
  const settings = resolveEmailBody(body);
  const readValue = (id: string) => String(settings[id as keyof EmailBodySettings]);
  const renderControl = (control: StyleControlConfig) => {
    const key = control.id as keyof EmailBodySettings;
    const current = String(settings[key]);
    const initial = String(DEFAULT_EMAIL_BODY[key]);
    return (
      <StyleControl
        key={key}
        config={localizeStyleControl(control, BODY_STYLE_KEYS[control.id], t)}
        value={current === initial ? "" : current}
        fallback={initial}
        resetLabel={t("common.reset")}
        onChange={(value) => onChange({
          [key]: value === "" ? DEFAULT_EMAIL_BODY[key] : key === "contentWidth" ? parseFloat(value) : value,
        })}
      />
    );
  };
  return (
    <div className="ree-inspector ree-inspector-body">
      {BODY_CONTROL_SECTIONS.map((section) => (
        <InspectorSection key={section.id} title={translateMetadata(t, SECTION_KEYS[section.id], section.title)}>
          <StyleControlStack controls={visibleStyleControls(section.controls, readValue)} renderControl={renderControl} />
          {section.id === "general" ? (
            <CheckboxControl
              variant="switch"
              label={t("inspector.linkUnderline")}
              checked={settings.linkDecoration === LINK_DECORATIONS.underline}
              onChange={(checked) => onChange({ linkDecoration: checked ? LINK_DECORATIONS.underline : LINK_DECORATIONS.none })}
            />
          ) : null}
        </InspectorSection>
      ))}
    </div>
  );
}
