import { createEmailEditorConfig } from "@standhigher/react-email-editor";
import { couponBlock } from "./coupon";
import { productBlock } from "./product";

export const editorConfig = createEmailEditorConfig({ plugins: [couponBlock, productBlock] });
