import { useEmailEditorConfig } from "@standhigher/react-email-editor";
import { couponBlock } from "./coupon";
import { productBlock } from "./product";

export function usePlaygroundConfig() {
  return useEmailEditorConfig({ plugins: [couponBlock, productBlock] });
}
