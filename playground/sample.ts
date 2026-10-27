import {
  BLOCK_TYPES,
  createBlockNode,
  createEmailDocument,
} from "@standhigher/react-email-editor";
import type {
  EmailBlockNode,
  EmailDocument,
  Variable,
} from "@standhigher/react-email-editor";

interface SampleBlockPatch {
  fields: EmailBlockNode["fields"];
  defaultData?: EmailBlockNode["defaultData"];
}

function sampleBlock(type: string, patch: SampleBlockPatch): EmailBlockNode {
  const block = createBlockNode(type);
  if (!block) {
    throw new Error(`Missing block definition: ${type}`);
  }
  return {
    ...block,
    fields: { ...block.fields, ...patch.fields },
    ...(patch.defaultData ? { defaultData: patch.defaultData } : {}),
  };
}

export const sampleVariables: Variable[] = [
  { name: "{{  store_name }}", description: "", value: "店铺名称" },
];

export const sampleDocument: EmailDocument = {
  ...createEmailDocument([
    sampleBlock(BLOCK_TYPES.heading, {
      fields: { html: '<p style="line-height:1.25"><span style="font-size:26px"><strong>{{  store_name }}</strong></span></p>' },
    }),
    sampleBlock(BLOCK_TYPES.text, {
      fields: { html: "<p>这封邮件用于本地预览画布、检查器和模板预览。</p>" },
    }),
    sampleBlock(BLOCK_TYPES.html, {
      defaultData: {
        has_products: true,
        products: [{ name: "示例商品", price: "¥99" }],
      },
      fields: {
        html: "{{if .has_products}}{{range .products}}<p>{{.name}} {{.price}}</p>{{end}}{{else}}<p>暂无商品</p>{{end}}",
      },
    }),
  ]),
  subject: "订单更新",
};
