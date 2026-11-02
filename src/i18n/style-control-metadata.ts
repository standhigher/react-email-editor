import type { StyleControlConfig } from "../types/block";
import type { TranslatableStyleControl, Translate } from "./types";

/** 显式声明拥有完整的文案控制权，包括从库定义复制出的控件和选项。 */
export function explicitStyleControl(control: TranslatableStyleControl): StyleControlConfig {
  const explicit = { ...control };
  delete explicit.labelKey;
  if (control.options) {
    explicit.options = control.options.map((option) => {
      const explicitOption = { ...option };
      delete explicitOption.labelKey;
      return explicitOption;
    });
  }
  return explicit;
}

export function localizeStyleControlLabels(control: TranslatableStyleControl, t: Translate): StyleControlConfig {
  if (!control.labelKey && !control.options?.some((option) => option.labelKey)) return control;
  return {
    ...control,
    label: control.labelKey ? t(control.labelKey) : control.label,
    options: control.options?.map((option) => ({ ...option, label: option.labelKey ? t(option.labelKey) : option.label })),
  };
}
