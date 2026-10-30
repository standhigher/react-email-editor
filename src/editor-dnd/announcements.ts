import type { Announcements } from "@dnd-kit/core";
import type { Translate } from "../i18n/types";

export function dragAnnouncements(t: Translate): Announcements {
  return {
    onDragStart: ({ active }) => t("dnd.start", { id: active.id }),
    onDragOver: ({ active, over }) => over
      ? t("dnd.over", { id: active.id, over: over.id })
      : t("dnd.outside", { id: active.id }),
    onDragEnd: ({ active, over }) => over
      ? t("dnd.end", { id: active.id, over: over.id })
      : t("dnd.outside", { id: active.id }),
    onDragCancel: ({ active }) => t("dnd.cancel", { id: active.id }),
  };
}
