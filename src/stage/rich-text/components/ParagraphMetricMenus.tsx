import { readCssLength } from "../../../utils/css-values";
import { LINE_HEIGHT_RANGE, PARAGRAPH_SPACING_MAX } from "../constants";
import type { RichTextMenu } from "../types";
import { MetricSlider } from "./MetricSlider";
import { ToolbarMenu } from "./ToolbarMenu";

interface ParagraphMetricMenusProps {
  menu: RichTextMenu | null;
  spacing: string;
  lineHeight: string;
  inheritedSpacing: string;
  inheritedLineHeight: string;
  onToggle: (menu: "spacing" | "lineHeight") => void;
  onSpacing: (value: string | null) => void;
  onLineHeight: (value: string | null) => void;
}

function clampAmount(value: string, fallback: string, min: number, max: number): number {
  const parsed = readCssLength(value || fallback);
  return Math.min(max, Math.max(min, parsed.amount));
}

function formatStep(value: number, step: number): string {
  const places = (String(step).split(".")[1] ?? "").length;
  return String(Number((Math.round(value / step) * step).toFixed(places)));
}

export function ParagraphMetricMenus({
  menu,
  spacing,
  lineHeight,
  inheritedSpacing,
  inheritedLineHeight,
  onToggle,
  onSpacing,
  onLineHeight,
}: ParagraphMetricMenusProps) {
  const spacingValue = clampAmount(spacing, inheritedSpacing, 0, PARAGRAPH_SPACING_MAX);
  const lineHeightValue = clampAmount(lineHeight, inheritedLineHeight, LINE_HEIGHT_RANGE.min, LINE_HEIGHT_RANGE.max);
  const lineHeightLabel = formatStep(lineHeightValue, LINE_HEIGHT_RANGE.step);
  return (
    <>
      <ToolbarMenu
        title="Paragraph spacing"
        open={menu === "spacing"}
        onToggle={() => onToggle("spacing")}
        label={spacing || inheritedSpacing}
      >
        <MetricSlider
          label="Space before"
          value={spacingValue}
          min={0}
          max={PARAGRAPH_SPACING_MAX}
          step={1}
          display={`${spacingValue}px`}
          overridden={Boolean(spacing)}
          onChange={(next) => onSpacing(`${next}px`)}
          onReset={() => onSpacing(null)}
        />
      </ToolbarMenu>
      <ToolbarMenu
        title="Line height"
        open={menu === "lineHeight"}
        onToggle={() => onToggle("lineHeight")}
        label={lineHeight || inheritedLineHeight || lineHeightLabel}
      >
        <MetricSlider
          label="Line height"
          value={lineHeightValue}
          min={LINE_HEIGHT_RANGE.min}
          max={LINE_HEIGHT_RANGE.max}
          step={LINE_HEIGHT_RANGE.step}
          display={lineHeightLabel}
          overridden={Boolean(lineHeight)}
          onChange={(next) => onLineHeight(formatStep(next, LINE_HEIGHT_RANGE.step))}
          onReset={() => onLineHeight(null)}
        />
      </ToolbarMenu>
    </>
  );
}
