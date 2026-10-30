import { useEditorTranslation } from "../../i18n/context";
import { useId } from "react";
import { Button } from "../../components/Button";
import { ControlRenderer } from "../ControlRenderer";
import { readControlValues } from "../../plugins/controls";
import { useListRows } from "./useListRows";
import type { ControlRendererProps } from "../ControlRenderer";

export function ListControl({ control, value, onChange, ...props }: ControlRendererProps) {
  const t = useEditorTranslation();
  const id = useId();
  const schema = control.itemControls ?? {};
  const { rows, updateRow, moveRow, removeRow, addRow } = useListRows(value, onChange);
  return (
    <fieldset className="ree-plugin-list"><legend>{control.label}</legend>
      {!rows.length ? <p className="ree-plugin-empty">{t("inspector.emptyList")}</p> : null}
      {rows.map((row, index) => <div key={`${id}-${row.key}`} className="ree-plugin-list-item">
        <div className="ree-plugin-list-actions"><span>{index + 1}</span><Button aria-label={t("inspector.moveItemUp", { label: control.label, index: index + 1 })} disabled={index === 0} onClick={() => moveRow(row.key, -1)}>↑</Button><Button aria-label={t("inspector.moveItemDown", { label: control.label, index: index + 1 })} disabled={index === rows.length - 1} onClick={() => moveRow(row.key, 1)}>↓</Button><Button aria-label={t("inspector.removeItem", { label: control.label, index: index + 1 })} onClick={() => removeRow(row.key)}>{t("common.remove")}</Button></div>
        {Object.entries(schema).map(([name, spec]) => <ControlRenderer key={name} {...props} control={{ ...spec, name }} value={row.value[name]} onChange={(nextValue) => updateRow(row.key, name, nextValue)} />)}
      </div>)}
      <Button onClick={() => addRow(readControlValues(schema, {}))}>{t("inspector.addItem")}</Button>
    </fieldset>
  );
}
