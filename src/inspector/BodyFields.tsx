import { DEFAULT_EMAIL_BODY } from "../document/constants";
import { LINK_DECORATIONS } from "../constants/style-values";
import { CheckboxControl } from "../components/CheckboxControl";
import { resolveEmailBody } from "../document/create-document";
import { BODY_FIELD_SECTIONS } from "./body-constants";
import { InspectorSection } from "./components/InspectorSection";
import { StyleFieldStack } from "./components/StyleFieldStack";
import { StyleControl } from "./StyleControl";
import type { StyleFieldConfig } from "../types/block";
import type { EmailBodySettings } from "../types/document";

interface BodyFieldsProps {
  body: EmailBodySettings;
  onChange: (patch: Partial<EmailBodySettings>) => void;
}

export function BodyFields({ body, onChange }: BodyFieldsProps) {
  const settings = resolveEmailBody(body);
  const renderField = (field: StyleFieldConfig) => {
    const key = field.id as keyof EmailBodySettings;
    const current = String(settings[key]);
    const initial = String(DEFAULT_EMAIL_BODY[key]);
    return (
      <StyleControl
        key={key}
        config={field}
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
      {BODY_FIELD_SECTIONS.map((section) => (
        <InspectorSection key={section.title} title={section.title}>
          <StyleFieldStack fields={section.fields} renderField={renderField} />
          {section.title === "General" ? (
            <CheckboxControl
              variant="switch"
              label="Link underline"
              checked={settings.linkDecoration === LINK_DECORATIONS.underline}
              onChange={(checked) => onChange({ linkDecoration: checked ? LINK_DECORATIONS.underline : LINK_DECORATIONS.none })}
            />
          ) : null}
          {section.advancedFields?.length ? (
            <details className="ree-inspector-advanced">
              <summary>Advanced: Border</summary>
              <div className="ree-inspector-section-body">
                <StyleFieldStack fields={section.advancedFields} renderField={renderField} />
              </div>
            </details>
          ) : null}
        </InspectorSection>
      ))}
    </div>
  );
}
