import { ControlEditor } from "@standhigher/react-email-editor";
import type { PluginEditorProps } from "@standhigher/react-email-editor";
import { ProductPicker } from "./ProductPicker";
import type { ProductControls } from "./product-schema";

export function ProductInspector({ controls, setControls }: PluginEditorProps<ProductControls>) {
  return <div className="ree-demo-product-inspector">
    <p>Select a product, then adjust its email content.</p>
    <ProductPicker label="Choose product" value={controls.name} onSelect={(product) => setControls({ productId: product.id, name: product.name, price: product.price, image: product.image, url: product.url })} />
    <ControlEditor control="name" />
    <ControlEditor control="price" />
    <ControlEditor control="image" />
    <ControlEditor control="url" />
    <ControlEditor control="description" />
    <ControlEditor control="footer" />
  </div>;
}
