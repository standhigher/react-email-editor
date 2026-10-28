import { useEffect, useState } from "react";
import { Button, TextInput } from "@standhigher/react-email-editor";
import { searchProducts } from "./product-schema";
import type { ProductOption } from "./product-schema";
import type { ControlComponentProps } from "@standhigher/react-email-editor";

interface ProductPickerProps extends Pick<ControlComponentProps<string>, "value" | "label"> {
  onSelect: (product: ProductOption) => void;
}

export function ProductPicker({ value, onSelect, label }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    searchProducts(query, controller.signal).then((next) => {
      if (!controller.signal.aborted) setProducts(next);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Search failed.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, attempt]);
  return <div className="ree-field">
    <label className="ree-field-label">{label}</label>
    <TextInput aria-label="Search products" placeholder="Search products" value={query} onChange={(event) => { setQuery(event.target.value); setLoading(true); setError(""); }} />
    <p>Selected: {value || "None"}</p>
    {loading ? <p role="status">Loading products…</p> : error ? <div role="alert">{error}<Button onClick={() => { setAttempt((previous) => previous + 1); setLoading(true); setError(""); }}>Retry</Button></div> : !products.length ? <p>No matching products.</p> : products.map((product) => <Button key={product.id} onClick={() => onSelect(product)}>{product.name}</Button>)}
  </div>;
}
