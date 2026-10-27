import { useImperativeHandle, type ForwardedRef } from "react";
import { documentToHtml } from "../render/document-html";
import type { EditorSession, EmailEditorHandle } from "../types/editor";

export function useEditorHandle(
  ref: ForwardedRef<EmailEditorHandle>,
  { getDocument, definitions, variables }: EditorSession,
) {
  useImperativeHandle(ref, () => ({
    getData: () => {
      const document = getDocument();
      return {
        document,
        json: JSON.stringify(document, null, 2),
        html: documentToHtml(document, definitions, { variables }),
        renderedHtml: documentToHtml(document, definitions, {
          resolveHtmlTemplates: true,
          variables,
        }),
      };
    },
    getDocument,
    getJson: () => JSON.stringify(getDocument(), null, 2),
    getHtml: () => documentToHtml(getDocument(), definitions, { variables }),
    getRenderedHtml: () => documentToHtml(getDocument(), definitions, {
      resolveHtmlTemplates: true,
      variables,
    }),
  }), [getDocument, definitions, variables]);
}
