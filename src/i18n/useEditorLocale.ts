import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TRANSLATION, getLoadedTranslation, loadTranslation, normalizeLocale } from "./runtime";

export function useEditorLocale(input?: string) {
  const locale = normalizeLocale(input);
  const [current, setCurrent] = useState(() => getLoadedTranslation(locale) ?? DEFAULT_TRANSLATION);
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(() => ({ locale, attempt }), [locale, attempt]);
  const [failure, setFailure] = useState<typeof request | null>(null);
  useEffect(() => {
    let cancelled = false;
    void loadTranslation(locale).then((next) => {
      if (!cancelled) setCurrent(next);
    }, () => {
      if (!cancelled) setFailure(request);
    });
    return () => { cancelled = true; };
  }, [locale, request]);
  return {
    translation: current,
    loading: current.locale !== locale && failure !== request,
    failed: failure === request,
    retry: () => setAttempt((value) => value + 1),
  };
}
