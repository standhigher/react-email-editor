import type { ReactNode } from "react";
import type { StyleControlConfig } from "../../types/block";

interface StyleControlStackProps {
  controls: StyleControlConfig[];
  renderControl: (control: StyleControlConfig) => ReactNode;
}

export function StyleControlStack({ controls, renderControl }: StyleControlStackProps) {
  const colors = controls.filter((control) => control.control === "color");
  const rest = controls.filter((control) => control.control !== "color");
  return (
    <>
      {colors.length > 0 ? <div className="ree-color-grid">{colors.map(renderControl)}</div> : null}
      {rest.map(renderControl)}
    </>
  );
}
