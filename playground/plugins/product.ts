import { ProductInspector } from "./ProductInspector";
import { defineBlock } from "@standhigher/react-email-editor";
import { ProductCanvas } from "./ProductCanvas";
import { productControls } from "./product-schema";

export const productBlock = defineBlock({
  type: "demo.product",
  title: "Product card",
  description: "Custom product picker and editable canvas regions",
  controls: productControls,
  defaultStyle: { dimension: { padding: "16px" } },
  Canvas: ProductCanvas,
  Inspector: ProductInspector,
  renderEmail: ({ controls, email }) => email.html`
    <p><strong>${controls.name}</strong></p>
    ${controls.image ? email.image({ src: controls.image, alt: controls.name }) : email.raw("")}
    ${email.richText(controls.description)}
    <p>$${controls.price.toFixed(2)}</p>
    ${email.button({ href: controls.url, label: "View product" })}
    ${email.richText(controls.footer)}
  `,
});
