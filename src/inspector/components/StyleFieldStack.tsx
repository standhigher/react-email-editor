import type { ReactNode } from "react";
import type { StyleFieldConfig } from "../../types/block";

interface StyleFieldStackProps {
  fields: StyleFieldConfig[];
  renderField: (field: StyleFieldConfig) => ReactNode;
}

export function StyleFieldStack({ fields, renderField }: StyleFieldStackProps) {
  const colors = fields.filter((field) => field.control === "color");
  const rest = fields.filter((field) => field.control !== "color");
  return (
    <>
      {colors.length > 0 ? <div className="ree-color-grid">{colors.map(renderField)}</div> : null}
      {rest.map(renderField)}
    </>
  );
}
