import { useEditorTranslation } from "../../i18n/context";
import { useRef } from "react";
import { Button } from "../../components/Button";
import { PREVIEW_BUFFER_SLOTS } from "./constants";
import { PreviewFrame } from "./PreviewFrame";
import type { PreviewBufferState } from "./types";

interface PreviewProps extends PreviewBufferState {
  onReady: (id: number) => void;
  onFailed: (id: number, message: string) => void;
  onRetry: () => void;
}

export function Preview({ frames, front, failure, onReady, onFailed, onRetry }: PreviewProps) {
  const t = useEditorTranslation();
  const scrollRef = useRef({ top: 0, left: 0 });
  return (
    <div className="ree-preview-buffer">
      {PREVIEW_BUFFER_SLOTS.map((index) => {
        const snapshot = frames[index];
        const visible = front === index;
        return (
          <div
            key={index}
            className={`ree-preview-stage${visible ? "" : " is-buffered"}`}
            aria-hidden={!visible}
            {...(!visible ? { inert: "" } : {})}
            ref={(node) => {
              if (node && visible) {
                node.scrollTop = scrollRef.current.top;
                node.scrollLeft = scrollRef.current.left;
              }
            }}
            onScroll={(event) => {
              if (visible) scrollRef.current = { top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft };
            }}
          >
            <div className="ree-email-viewport" style={{ width: snapshot?.width, marginLeft: "auto", marginRight: "auto" }}>
              {snapshot ? <PreviewFrame key={snapshot.id} snapshot={snapshot} onReady={onReady} onFailed={onFailed} /> : null}
            </div>
          </div>
        );
      })}
      {failure ? <div className="ree-plugin-error ree-preview-error" role="alert"><p>{failure.message}</p><Button onClick={onRetry}>{t("common.retry")}</Button></div> : null}
    </div>
  );
}
