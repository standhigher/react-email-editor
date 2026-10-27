import type { CSSProperties, PointerEvent } from "react";
import type { HsvColor } from "./colors";

interface ColorSaturationProps {
  color: HsvColor;
  onChange: (color: HsvColor) => void;
}

export function ColorSaturation({ color, onChange }: ColorSaturationProps) {
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    onChange({
      ...color,
      saturation: Math.min(100, Math.max(0, (event.clientX - rect.left) / rect.width * 100)),
      brightness: Math.min(100, Math.max(0, (1 - (event.clientY - rect.top) / rect.height) * 100)),
    });
  };

  return (
    <div
      className="ree-color-saturation"
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(color.saturation)}
      aria-valuetext={`Saturation ${Math.round(color.saturation)}%, brightness ${Math.round(color.brightness)}%. Use left/right for saturation and up/down for brightness.`}
      style={{ "--ree-color-hue": `hsl(${color.hue} 100% 50%)` } as CSSProperties}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 10 : 1;
        let { saturation, brightness } = color;
        switch (event.key) {
          case "ArrowLeft": saturation -= step; break;
          case "ArrowRight": saturation += step; break;
          case "ArrowUp": brightness += step; break;
          case "ArrowDown": brightness -= step; break;
          case "Home": saturation = 0; break;
          case "End": saturation = 100; break;
          default: return;
        }
        event.preventDefault();
        onChange({
          ...color,
          saturation: Math.min(100, Math.max(0, saturation)),
          brightness: Math.min(100, Math.max(0, brightness)),
        });
      }}
    >
      <span className="ree-color-cursor" style={{ left: `${color.saturation}%`, top: `${100 - color.brightness}%` }} />
    </div>
  );
}
