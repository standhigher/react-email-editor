import { DEFAULT_EMAIL_GLOBAL } from "../document/constants";
import { resolveEmailGlobal } from "../document/create-document";
import { GLOBAL_FIELD_SECTIONS } from "./global-constants";
import { InspectorSection } from "./components/InspectorSection";
import { StyleFieldStack } from "./components/StyleFieldStack";
import { StyleControl } from "./StyleControl";
import type { StyleFieldConfig } from "../types/block";
import type { EmailGlobalSettings } from "../types/document";

interface GlobalFieldsProps {
  global: EmailGlobalSettings;
  onChange: (patch: Partial<EmailGlobalSettings>) => void;
}

export function GlobalFields({ global, onChange }: GlobalFieldsProps) {
  const settings = resolveEmailGlobal(global);
  const renderField = (field: StyleFieldConfig) => {
    const key = field.id as keyof EmailGlobalSettings;
    const current = String(settings[key]);
    const initial = String(DEFAULT_EMAIL_GLOBAL[key]);
    return (
      <StyleControl
        key={key}
        config={field}
        value={current === initial ? "" : current}
        fallback={initial}
        resetLabel="Reset"
        onChange={(value) => onChange({
          [key]: value === "" ? DEFAULT_EMAIL_GLOBAL[key] : key === "contentWidth" ? parseFloat(value) : value,
        })}
      />
    );
  };
  return (
    <div className="ree-inspector ree-inspector-global">
      {GLOBAL_FIELD_SECTIONS.map((section) => (
        <InspectorSection key={section.title} title={section.title}>
          <StyleFieldStack fields={section.fields} renderField={renderField} />
        </InspectorSection>
      ))}
    </div>
  );
}
