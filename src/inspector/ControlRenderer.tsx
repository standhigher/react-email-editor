import { BasicControl } from "./components/BasicControl";
import { ListControl } from "./components/ListControl";
import { ImageControl } from "./components/ImageControl";
import { RichTextControl } from "./components/RichTextControl";
import { HtmlControl } from "./components/HtmlControl";
import type { ControlConfig, Variable } from "../types/block";
import type { EmailBodySettings } from "../types/document";

export interface ControlRendererProps {
  control: ControlConfig;
  value: unknown;
  variables: Variable[];
  body: EmailBodySettings;
  onChange: (value: unknown) => void;
}

export function ControlRenderer(props: ControlRendererProps) {
  const { control, value, onChange, variables, body } = props;
  const error = control.validateValue?.(value);
  let renderedControl;
  if (control.renderControl) renderedControl = control.renderControl({ value: structuredClone(value), onChange, label: control.label, variables: structuredClone(variables), body: structuredClone(body) });
  else if (control.kind === "list") renderedControl = <ListControl {...props} />;
  else if (control.kind === "image") renderedControl = <ImageControl {...props} />;
  else if (control.kind === "richText") renderedControl = <RichTextControl {...props} />;
  else if (control.kind === "html") renderedControl = <HtmlControl {...props} />;
  else renderedControl = <BasicControl {...props} />;
  return <div className="ree-plugin-field">{renderedControl}{error ? <p className="ree-plugin-error" role="alert">{error}</p> : null}</div>;
}
