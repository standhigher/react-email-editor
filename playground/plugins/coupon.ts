import { defineBlock, EmailControls } from "@standhigher/react-email-editor";

export const couponBlock = defineBlock({
  type: "demo.coupon",
  title: "Coupon",
  description: "Declarative controls and email rendering",
  controls: {
    html: EmailControls.richText({ label: "Message", defaultValue: "<p>Thanks for shopping with us.</p>" }),
    code: EmailControls.text({ label: "Coupon code", defaultValue: "SAVE20", validate: (value) => value.trim() ? undefined : "Enter a coupon code." }),
    showCode: EmailControls.boolean({ label: "Show coupon code", defaultValue: true }),
    details: EmailControls.list({ label: "Terms", controls: { text: EmailControls.text({ label: "Term", defaultValue: "One use per customer" }) } }),
  },
  defaultStyle: { dimension: { padding: "16px" }, decorations: { backgroundColor: "#f5f5f5" } },
  renderEmail: ({ controls, email }) => email.html`
    ${email.richText(controls.html)}
    ${controls.showCode ? email.html`<p><strong>${controls.code}</strong></p>` : email.raw("")}
    ${controls.details.map((item) => email.html`<p>${item.text}</p>`)}
  `,
});
