import { useMemo } from "react";
import { CANVAS_DEVICE_WIDTH } from "../../constants/editor";
import { documentToHtml } from "../../render/document-html";
import type { BlockDefinition } from "../../types/block";
import type { EmailDocument } from "../../types/document";
import type { EditorDevice } from "../../types/editor";

interface PreviewProps {
  document: EmailDocument;
  definitions: BlockDefinition[];
  device: EditorDevice;
}

export function Preview({ document, definitions, device }: PreviewProps) {
  const html = useMemo(
    () => documentToHtml(document, definitions),
    [document, definitions],
  );

  return (
    <div className="ree-preview-stage">
      <iframe
        className="ree-preview-frame"
        title="Email preview"
        srcDoc={html}
        style={{ width: CANVAS_DEVICE_WIDTH[device] }}
      />
    </div>
  );
}
