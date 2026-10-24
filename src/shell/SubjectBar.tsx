import { useRef } from "react";
import { SUBJECT_MAX_LENGTH } from "../constants/editor";
import { PERSONALIZATION_HINT } from "./constants";
import { PersonalizationMenu } from "./PersonalizationMenu";
import type { Variable } from "../types/block";

interface SubjectBarProps {
  subject: string;
  variables: Variable[];
  onSubjectChange: (subject: string) => void;
  onReset: () => void;
}

export function SubjectBar({
  subject,
  variables,
  onSubjectChange,
  onReset,
}: SubjectBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertVariable = (name: string) => {
    const input = inputRef.current;
    const token = `{{${name}}}`;
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
      <label className="ree-subject-label" htmlFor="ree-email-subject">
        Email subject
      </label>
      <input
        id="ree-email-subject"
        ref={inputRef}
        className="ree-subject-input"
        value={subject}
        maxLength={SUBJECT_MAX_LENGTH}
        onChange={(event) => onSubjectChange(event.target.value)}
      />
      <span className="ree-subject-count">
        {subject.length}/{SUBJECT_MAX_LENGTH}
      </span>
      {variables.length > 0 ? (
        <>
          <PersonalizationMenu variables={variables} onInsert={insertVariable} />
          <p className="ree-subject-hint">{PERSONALIZATION_HINT}</p>
        </>
      ) : null}
      <button type="button" className="ree-btn ree-subject-reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
