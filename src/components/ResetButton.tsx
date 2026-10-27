interface ResetButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function ResetButton({ label, disabled = false, onClick }: ResetButtonProps) {
  return (
    <button type="button" className="ree-reset" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M13 8a5 5 0 1 1-1.4-3.45" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M12.2 2.4v2.7h-2.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
