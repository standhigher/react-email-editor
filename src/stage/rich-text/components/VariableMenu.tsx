import type { Variable } from "../../../types/block";

interface VariableMenuProps {
  variables: Variable[];
  onInsert: (name: string) => void;
}

export function VariableMenu({ variables, onInsert }: VariableMenuProps) {
  if (variables.length === 0) {
    return <div className="ree-personalization-empty">No personalization fields</div>;
  }

  return (
    <div className="ree-rte-variables">
      {variables.map((variable) => (
        <button
          key={variable.name}
          type="button"
          className="ree-var-item"
          onClick={() => onInsert(variable.name)}
        >
          <span className="ree-var-name">{variable.name}</span>
          {variable.description ? <span className="ree-var-label">{variable.description}</span> : null}
        </button>
      ))}
    </div>
  );
}
