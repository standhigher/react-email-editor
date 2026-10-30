import { useEmailEditorConfig } from "@standhigher/react-email-editor";
import { couponBlock } from "./coupon";
import { productBlock } from "./product";

export function usePlaygroundConfig(locale?: string) {
  return useEmailEditorConfig({ locale, plugins: [couponBlock, productBlock] });
}
