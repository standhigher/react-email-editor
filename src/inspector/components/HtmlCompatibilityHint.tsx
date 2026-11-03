import { Button } from "../../components/Button";
import { useEditorTranslation } from "../../i18n/context";

export function HtmlCompatibilityHint() {
  const t = useEditorTranslation();

  return (
    <Button
      variant="icon"
      className="ree-html-info"
      aria-label={t("inspector.htmlCompatibility")}
      tooltip={t("inspector.htmlCompatibilityHint")}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </svg>
    </Button>
  );
}
