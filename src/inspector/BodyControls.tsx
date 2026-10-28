import { DEFAULT_EMAIL_BODY } from "../document/constants";
import { LINK_DECORATIONS } from "../constants/style-values";
import { CheckboxControl } from "../components/CheckboxControl";
import { resolveEmailBody } from "../document/create-document";
import { BODY_CONTROL_SECTIONS } from "./body-constants";
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
  const settings = resolveEmailBody(body);
  const renderControl = (control: StyleControlConfig) => {
    const key = control.id as keyof EmailBodySettings;
    const current = String(settings[key]);
    const initial = String(DEFAULT_EMAIL_BODY[key]);
    return (
      <StyleControl
        key={key}
        config={control}
        value={current === initial ? "" : current}
        fallback={initial}
        resetLabel="Reset"
        onChange={(value) => onChange({
          [key]: value === "" ? DEFAULT_EMAIL_BODY[key] : key === "contentWidth" ? parseFloat(value) : value,
        })}
      />
    );
  };
  return (
    <div className="ree-inspector ree-inspector-body">
      {BODY_CONTROL_SECTIONS.map((section) => (
        <InspectorSection key={section.title} title={section.title}>
          <StyleControlStack controls={section.controls} renderControl={renderControl} />
          {section.title === "General" ? (
            <CheckboxControl
              variant="switch"
              label="Link underline"
              checked={settings.linkDecoration === LINK_DECORATIONS.underline}
              onChange={(checked) => onChange({ linkDecoration: checked ? LINK_DECORATIONS.underline : LINK_DECORATIONS.none })}
            />
          ) : null}
          {section.advancedControls?.length ? (
            <details className="ree-inspector-advanced">
              <summary>Advanced: Border</summary>
              <div className="ree-inspector-section-body">
                <StyleControlStack controls={section.advancedControls} renderControl={renderControl} />
              </div>
            </details>
          ) : null}
        </InspectorSection>
      ))}
    </div>
  );
}
