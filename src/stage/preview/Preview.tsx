import { useMemo } from "react";
import { CANVAS_DEVICE_WIDTH } from "../../constants/editor";
import { documentToHtml } from "../../render/document-html";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailDocument } from "../../types/document";
import type { EditorDevice } from "../../types/editor";

interface PreviewProps {
  document: EmailDocument;
  definitions: BlockDefinition[];
  variables: Variable[];
  device: EditorDevice;
}

export function Preview({ document, definitions, variables, device }: PreviewProps) {
  const html = useMemo(
    () => documentToHtml(document, definitions, {
      resolveHtmlTemplates: true,
      variables,
    }),
    [document, definitions, variables],
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
