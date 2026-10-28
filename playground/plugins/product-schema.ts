import { EmailControls } from "@standhigher/react-email-editor";
import type { ControlValues } from "@standhigher/react-email-editor";

export const productControls = {
  productId: EmailControls.text({ label: "Product ID", defaultValue: "mug" }),
  name: EmailControls.text({ label: "Product name", defaultValue: "Travel mug" }),
  description: EmailControls.richText({ label: "Description", defaultValue: "<p>Keep your drink warm.</p>" }),
  footer: EmailControls.richText({ label: "Footer", defaultValue: "<p>Made for everyday adventures.</p>" }),
  price: EmailControls.number({ label: "Price", defaultValue: 29, min: 0, step: 0.01 }),
  image: EmailControls.image({ label: "Product image" }),
  url: EmailControls.url({ label: "Product link", defaultValue: "https://example.com/products/mug" }),
};

export type ProductControls = ControlValues<typeof productControls>;

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string;
}

// 模拟消费方自己的商品服务；实际接入时替换该函数即可。
export async function searchProducts(query: string, signal: AbortSignal): Promise<ProductOption[]> {
  const products: ProductOption[] = [
    { id: "mug", name: "Travel mug", price: 29, image: "https://placehold.co/320x180?text=Mug", url: "https://example.com/products/mug" },
    { id: "bottle", name: "Water bottle", price: 19, image: "https://placehold.co/320x180?text=Bottle", url: "https://example.com/products/bottle" },
    { id: "bag", name: "Canvas bag", price: 15, image: "https://placehold.co/320x180?text=Bag", url: "https://example.com/products/bag" },
  ];
  await Promise.resolve();
  signal.throwIfAborted();
  return products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
}
