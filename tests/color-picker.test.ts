import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// 与 bundler 的无扩展名源码导入保持一致，仅补齐此模块使用的常量依赖。
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === "../../constants/style-values" ? `${specifier}.ts` : specifier, context);
  },
});
const { colorToHex, hexToHsv, hsvToHex, normalizeHex } = await import("../src/components/color-picker/colors.ts");

test("HEX 输入支持简写、大小写和省略井号，拒绝不完整及无效色值", () => {
  assert.equal(normalizeHex(" #AbC "), "#aabbcc");
  assert.equal(normalizeHex("ABCDEF"), "#abcdef");
  for (const value of ["", "#1", "#abcd", "#12345", "#1234567", "#gggggg", "red"]) {
    assert.equal(normalizeHex(value), null, value);
  }
});

test("重新打开颜色面板时识别 TipTap 序列化的 RGB 色值", () => {
  assert.equal(colorToHex("rgb(18, 52, 86)"), "#123456");
  assert.equal(colorToHex("rgb(0, 91, 211)"), colorToHex("#005BD3"));
  assert.equal(colorToHex("#abc"), "#aabbcc");
  assert.equal(colorToHex("transparent"), null);
  assert.equal(colorToHex("rgb(999, 0, 0)"), null);
  assert.equal(colorToHex("rgb(.., 0, 0)"), null);
});

test("选色区和色相转换保留 HEX，包括灰阶、黑白及色相边界", () => {
  for (const hex of ["#000000", "#ffffff", "#888888", "#ff0000", "#00ff00", "#0000ff", "#00ffff", "#ff00ff", "#ffff00", "#123456", "#005bd3", "#aabbcc"]) {
    assert.equal(hsvToHex(hexToHsv(hex)), hex);
  }
  assert.equal(hsvToHex({ hue: 360, saturation: 100, brightness: 100 }), "#ff0000");
  assert.equal(hsvToHex({ hue: -60, saturation: 100, brightness: 100 }), "#ff00ff");
});
