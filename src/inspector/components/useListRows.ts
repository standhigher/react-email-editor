import { useLayoutEffect, useRef, useState } from "react";

interface ListRow {
  key: number;
  value: Record<string, unknown>;
}

interface ListState {
  source: unknown;
  rows: ListRow[];
  nextKey: number;
}

/** 异步控件按稳定行标识更新最新状态，避免旧回调覆盖后续编辑。 */
export function useListRows(value: unknown, onChange: (value: unknown) => void) {
  const [state, setState] = useState<ListState>({ source: undefined, rows: [], nextKey: 0 });
  if (state.source !== value) {
    const available = [...state.rows];
    let nextKey = state.nextKey;
    const items: unknown[] = Array.isArray(value) ? value : [];
    const rows = items.map((item) => {
      const match = available.findIndex((row) => JSON.stringify(row.value) === JSON.stringify(item));
      const key = match < 0 ? nextKey++ : available.splice(match, 1)[0].key;
      return { key, value: item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {} };
    });
    setState({ source: value, rows, nextKey });
  }
  const latest = useRef<ListState | null>(state);
  useLayoutEffect(() => {
    latest.current = state;
    return () => { latest.current = null; };
  }, [state]);

  const commit = (update: (current: ListState) => ListState) => {
    const current = latest.current;
    if (!current) return;
    const next = update(current);
    if (next === current) return;
    const values = next.rows.map((row) => row.value);
    const snapshot = { ...next, source: values };
    latest.current = snapshot;
    setState(snapshot);
    onChange(values);
  };
  const updateRow = (key: number, name: string, nextValue: unknown) => commit((current) => {
    if (!current.rows.some((row) => row.key === key)) return current;
    return { ...current, rows: current.rows.map((row) => row.key === key ? { ...row, value: { ...row.value, [name]: nextValue } } : row) };
  });
  const moveRow = (key: number, direction: -1 | 1) => commit((current) => {
    const index = current.rows.findIndex((row) => row.key === key);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.rows.length) return current;
    const rows = [...current.rows];
    [rows[index], rows[target]] = [rows[target], rows[index]];
    return { ...current, rows };
  });
  const removeRow = (key: number) => commit((current) => {
    if (!current.rows.some((row) => row.key === key)) return current;
    return { ...current, rows: current.rows.filter((row) => row.key !== key) };
  });
  const addRow = (item: Record<string, unknown>) => commit((current) => ({
    ...current, nextKey: current.nextKey + 1, rows: [...current.rows, { key: current.nextKey, value: item }],
  }));
  return { rows: state.rows, updateRow, moveRow, removeRow, addRow };
}
