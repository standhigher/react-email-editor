import { EditableRichText } from "@standhigher/react-email-editor";
import type { PluginEditorProps } from "@standhigher/react-email-editor";
import type { ProductControls } from "./product-schema";

export function ProductCanvas({ controls }: PluginEditorProps<ProductControls>) {
  return <div className="ree-demo-product">
    <strong>{controls.name}</strong>
    <EditableRichText control="description" />
    <p>${controls.price.toFixed(2)}</p>
    <EditableRichText control="footer" />
  </div>;
}
