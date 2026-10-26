import {
  CONTENT_WIDTH_MAX,
  CONTENT_WIDTH_MIN,
  CONTENT_WIDTH_STEP,
} from "../constants/editor";
import { fontFamilyOptions } from "../document/constants";
import { AlignControl } from "./components/AlignControl";
import { ColorControl } from "./components/ColorControl";
import { RangeControl } from "./components/RangeControl";
import { SelectControl } from "./components/SelectControl";
import { GLOBAL_FONT_WEIGHTS } from "./constants";
import type { EmailGlobalSettings } from "../types/document";

interface GlobalFieldsProps {
  global: EmailGlobalSettings;
  onChange: (patch: Partial<EmailGlobalSettings>) => void;
}

export function GlobalFields({ global, onChange }: GlobalFieldsProps) {
  const setAlign = (value: string) => {
    if (value === "left" || value === "center" || value === "right") {
      onChange({ contentAlign: value });
    }
  };

  return (
    <div className="ree-inspector">
      <div className="ree-inspector-head">
        <span className="ree-inspector-title">Global</span>
      </div>

      <section className="ree-inspector-section">
        <div className="ree-inspector-section-title">General</div>

        <div className="ree-field">
          <label className="ree-field-label">Text color</label>
          <ColorControl
            value={global.textColor}
            onChange={(textColor) => onChange({ textColor })}
          />
        </div>

        <div className="ree-field">
          <label className="ree-field-label">Background color</label>
          <ColorControl
            value={global.backgroundColor}
            fallback="#ffffff"
            onChange={(backgroundColor) => onChange({ backgroundColor })}
          />
        </div>

        <div className="ree-field">
          <div className="ree-field-label">
            <span>Content width</span>
            <span className="ree-field-value">{global.contentWidth}px</span>
          </div>
          <RangeControl
            value={global.contentWidth}
            min={CONTENT_WIDTH_MIN}
            max={CONTENT_WIDTH_MAX}
            step={CONTENT_WIDTH_STEP}
            onChange={(contentWidth) => onChange({ contentWidth })}
          />
        </div>

        <div className="ree-field">
          <div className="ree-field-label">
            <span>Content alignment</span>
          </div>
          <AlignControl value={global.contentAlign} onChange={setAlign} />
        </div>

        <div className="ree-field">
          <label className="ree-field-label">Font family</label>
          <SelectControl
            value={global.fontFamily}
            options={fontFamilyOptions(global.fontFamily)}
            onChange={(fontFamily) => onChange({ fontFamily })}
          />
        </div>

        <div className="ree-field">
          <label className="ree-field-label">Font weight</label>
          <SelectControl
            value={global.fontWeight}
            options={[...GLOBAL_FONT_WEIGHTS]}
            onChange={(fontWeight) =>
              onChange({ fontWeight: fontWeight === "bold" ? "bold" : "normal" })
            }
          />
        </div>
      </section>
    </div>
  );
}
