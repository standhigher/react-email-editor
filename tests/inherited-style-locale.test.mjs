import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
const { defineBlock } = await import("../src/plugins/define-block.ts");
const { EmailControls } = await import("../src/plugins/controls.ts");
const { buildEmailEditorConfig } = await import("../src/plugins/config.ts");
const { localizeDefinition } = await import("../src/i18n/metadata.ts");
const { loadTranslation } = await import("../src/i18n/runtime.ts");
const { WRAPPER_STYLE_CONTROLS } = await import("../src/blocks/style-controls.ts");
const { documentToHtml } = await import("../src/render/document-html.ts");
const { createEmailDocument } = await import("../src/document/create-document.ts");
const { DEFAULT_BLOCKS } = await import("../src/blocks/registry.ts");

const locales = ["en", "zh-CN", "es", "pt-PT", "fr"];
const styleKeys = {
  "dimension.padding": "inspector.blockPadding",
  "dimension.margin": "inspector.margin",
  "decorations.backgroundColor": "inspector.blockBackground",
  "decorations.borderColor": "inspector.blockBorder",
  "decorations.borderWidth": "inspector.blockBorderWidth",
  "decorations.borderStyle": "inspector.blockBorderStyle",
  "decorations.borderRadius": "inspector.blockRadius",
};

function plugin(options = {}) {
  return defineBlock({
    type: "shop.card", title: "Custom title", description: "Custom description",
    controls: { href: EmailControls.url({ label: "Custom link", placeholder: "Custom hint" }) },
    renderEmail: () => "<p>{{store_name}}</p>",
    ...options,
  });
}

test("内置区块样式携带翻译 key，通过快照复制及连续本地化后仍使用同一翻译路径", async () => {
  const config = buildEmailEditorConfig();
  for (const source of DEFAULT_BLOCKS) {
    const registered = config.definitions.find((item) => item.type === source.type);
    const document = createEmailDocument([config.createBlock(source.type)]);
    const html = config.toHtml(document);
    let copied = { ...registered, styleControls: structuredClone(registered.styleControls) };
    for (const locale of locales) {
      const { t } = await loadTranslation(locale);
      for (const original of [source, registered, copied]) {
        const localized = localizeDefinition(original, t);
        for (const [index, control] of original.styleControls.entries()) {
          assert.ok(control.labelKey, `${source.type}: ${control.id} 缺少声明元数据`);
          assert.equal(localized.styleControls[index].label, t(control.labelKey));
          for (const [optionIndex, option] of (control.options ?? []).entries()) {
            assert.ok(option.labelKey, `${source.type}: ${control.id}/${option.value}`);
            assert.equal(localized.styleControls[index].options[optionIndex].label, t(option.labelKey));
          }
        }
        assert.equal(documentToHtml(document, [localized]), html);
      }
      copied = localizeDefinition(copied, t);
    }
  }
});

test("五种语言翻译自动继承的公共控件及边框选项，配置快照和导出保持原样", async () => {
  const source = plugin();
  const config = buildEmailEditorConfig({ plugins: [source] });
  const definition = config.definitions.find((item) => item.type === source.type);
  const originalStyles = structuredClone(source.styleControls);
  const document = createEmailDocument([config.createBlock(source.type)]);
  const originalDocument = structuredClone(document);
  const html = config.toHtml(document);
  for (const locale of locales) {
    const { t } = await loadTranslation(locale);
    const copied = { ...definition, styleControls: structuredClone(definition.styleControls) };
    for (const original of [source, definition, copied]) {
      const localized = localizeDefinition(original, t);
      assert.equal(localized.title, source.title);
      assert.equal(localized.description, source.description);
      for (const key of ["controls", "schema", "inspectorSections", "renderEmail", "readControls", "defaultStyle", "defaultData"]) {
        assert.equal(localized[key], original[key], `${locale}: ${key}`);
      }
      for (const control of localized.styleControls) {
        assert.equal(control.label, t(styleKeys[control.id]), `${locale}: ${control.id}`);
        if (control.options) {
          assert.deepEqual(control.options.map((option) => option.value), ["none", "solid", "dashed", "dotted"]);
          for (const option of control.options) assert.equal(option.label, t(`common.${option.value}`));
        }
      }
      assert.equal(documentToHtml(document, [localized]), html);
    }
    assert.deepEqual(config.createBlock(source.type).style, document.blocks[0].style);
    assert.deepEqual(definition.styleControls, originalStyles);
    assert.deepEqual(source.styleControls, originalStyles);
    assert.deepEqual(document, originalDocument);
  }
});

test("显式同 ID 控件与选项始终由集成方管理，即使文案和库默认值相同", async () => {
  const explicit = WRAPPER_STYLE_CONTROLS.filter((control) => ["dimension.padding", "decorations.borderStyle"].includes(control.id));
  for (const styles of [explicit, explicit.map((control) => ({
    ...control, label: `Business ${control.id}`,
    options: control.options?.map((option) => ({ ...option, label: `Business ${option.value}` })),
  }))]) {
    const source = plugin({
      type: "text", override: true,
      styleControls: [...styles, { id: "element.borderStyle", group: "general", control: "select", label: "Business style", options: [{ value: "solid", label: "Business solid" }] }],
      inspectorSections: [{ id: "spacing", title: "Custom section", styleIds: Object.keys(styleKeys) }],
    });
    const config = buildEmailEditorConfig({ plugins: [source] });
    for (const locale of locales) {
      const { t } = await loadTranslation(locale);
      for (const original of [source, config.definitions.find((item) => item.type === "text")]) {
        const localized = localizeDefinition(original, t);
        assert.equal(localized.title, "Custom title");
        assert.equal(localized.controls, original.controls);
        assert.equal(localized.inspectorSections, original.inspectorSections);
        for (const id of ["dimension.padding", "decorations.borderStyle", "element.borderStyle"]) {
          assert.equal(localized.styleControls.find((control) => control.id === id), original.styleControls.find((control) => control.id === id));
        }
        assert.equal(localized.styleControls.find((control) => control.id === "dimension.margin").label, t("inspector.margin"));
      }
    }
  }
});

test("关闭或分组启用容器样式只翻译实际继承项，显式重加的控件不归库管理", async () => {
  for (const containerStyles of [false, { spacing: false }, { appearance: false }, { spacing: false, appearance: false }, true]) {
    const source = plugin({ containerStyles });
    const explicit = plugin({ containerStyles: false, styleControls: WRAPPER_STYLE_CONTROLS });
    const config = buildEmailEditorConfig({ plugins: [source] });
    for (const locale of locales) {
      const { t } = await loadTranslation(locale);
      assert.equal(localizeDefinition(explicit, t), explicit);
      const localized = localizeDefinition(config.definitions.find((item) => item.type === source.type), t);
      assert.deepEqual(localized.styleControls.map((control) => control.id), source.styleControls.map((control) => control.id));
      for (const control of localized.styleControls) assert.equal(control.label, t(styleKeys[control.id]));
      if (containerStyles === false || (containerStyles.spacing === false && containerStyles.appearance === false)) assert.deepEqual(localized.styleControls, []);
    }
  }
});

test("复制已注册的公共控件再显式修改标签和选项时，内部翻译 key 不覆盖集成方文案", async () => {
  const inherited = plugin();
  const config = buildEmailEditorConfig({ plugins: [inherited] });
  const definition = config.definitions.find((item) => item.type === inherited.type);
  const border = definition.styleControls.find((control) => control.id === "decorations.borderStyle");
  const custom = plugin({ styleControls: [{
    ...border, label: "Custom border",
    options: border.options.map((option) => ({ ...option, label: `Custom ${option.value}` })),
  }] });
  const customConfig = buildEmailEditorConfig({ plugins: [custom] });
  const registered = customConfig.definitions.find((item) => item.type === custom.type);
  for (const locale of locales) {
    const { t } = await loadTranslation(locale);
    const localized = localizeDefinition(registered, t);
    const actual = localized.styleControls.find((control) => control.id === border.id);
    assert.equal(actual.label, "Custom border");
    assert.deepEqual(actual.options.map((option) => option.label), border.options.map((option) => `Custom ${option.value}`));
    assert.equal(localized.styleControls.find((control) => control.id === "dimension.padding").label, t("inspector.blockPadding"));
  }
});
