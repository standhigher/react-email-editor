import { useEditorTranslation } from "../i18n/context";
import { useId, useRef } from "react";
import { TextInput } from "../components/TextInput";
import { SUBJECT_MAX_LENGTH } from "../constants/editor";
import { PersonalizationMenu } from "../components/PersonalizationMenu";
import type { Variable } from "../types/block";

interface SubjectBarProps {
  subject: string;
  variables: Variable[];
  onSubjectChange: (subject: string) => void;
}

export function SubjectBar({
  subject,
  variables,
  onSubjectChange,
}: SubjectBarProps) {
  const t = useEditorTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const subjectId = useId();
  const countId = useId();

  const insertVariable = (token: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? subject.length;
    const end = input?.selectionEnd ?? subject.length;
    const next = (subject.slice(0, start) + token + subject.slice(end)).slice(
      0,
      SUBJECT_MAX_LENGTH,
    );
    onSubjectChange(next);
    const cursor = Math.min(start + token.length, next.length);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="ree-subject-bar">
      <label className="ree-subject-label" htmlFor={subjectId}>
        {t("editor.emailSubject")}
      </label>
      <div className="ree-subject-field">
        <TextInput
          id={subjectId}
          ref={inputRef}
          className="ree-subject-input"
          value={subject}
          maxLength={SUBJECT_MAX_LENGTH}
          aria-describedby={countId}
          onChange={(event) => onSubjectChange(event.target.value)}
        />
        <span id={countId} className="ree-subject-count">
          {subject.length}/{SUBJECT_MAX_LENGTH}
        </span>
      </div>
      {variables.length > 0 ? (
        <>
          <PersonalizationMenu variables={variables} onInsert={insertVariable} />
          <p className="ree-subject-hint">{t("editor.variableHint")}</p>
        </>
      ) : null}
    </div>
  );
}
