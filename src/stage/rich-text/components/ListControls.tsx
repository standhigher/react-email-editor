import type { Editor } from "@tiptap/react";
import { readCssLength } from "../../../utils/css-values";
import { focusSelection } from "../formatting";
import { toggleTextList } from "../list-formatting";
import type { EditorTextRange, RichTextInheritedStyle, RichTextMenu, ToolbarState } from "../types";
import { MetricSlider } from "./MetricSlider";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarIcon } from "./ToolbarIcon";
import { ToolbarMenu } from "./ToolbarMenu";

interface ListControlsProps {
  editor: Editor;
  state: ToolbarState;
  menu: RichTextMenu | null;
  range: EditorTextRange | null;
  inherited: RichTextInheritedStyle;
  onToggle: (menu: RichTextMenu) => void;
}

export function ListControls({ editor, state, menu, range, inherited, onToggle }: ListControlsProps) {
  const listType = state.orderedList ? "orderedList" : "bulletList";
  const spacing = state.listSpacing || inherited.listSpacing || "4px";
  const indent = state.listIndent || inherited.listIndent || "22px";
  const update = (key: "listSpacing" | "listIndent", value: string | null) => {
    focusSelection(editor, range).updateAttributes(listType, { [key]: value }).run();
  };
  return (
    <div className="ree-rte-group" role="group" aria-label="Lists">
      <ToolbarButton
        title="Bulleted list"
        active={state.bulletList}
        onClick={() => toggleTextList(editor, "bulletList")}
      >
        <ToolbarIcon name="list-bullet" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={state.orderedList}
        onClick={() => toggleTextList(editor, "orderedList")}
      >
        <ToolbarIcon name="list-ordered" />
      </ToolbarButton>
      {state.bulletList || state.orderedList ? (
        <ToolbarMenu title="List settings" label="List" open={menu === "list"} onToggle={() => onToggle("list")}>
          <MetricSlider
            label="List spacing"
            value={readCssLength(spacing).amount}
            min={0}
            max={48}
            step={1}
            display={spacing}
            overridden={Boolean(state.listSpacing)}
            onChange={(value) => update("listSpacing", `${value}px`)}
            onReset={() => update("listSpacing", null)}
          />
          <MetricSlider
            label="List indent"
            value={readCssLength(indent).amount}
            min={0}
            max={64}
            step={1}
            display={indent}
            overridden={Boolean(state.listIndent)}
            onChange={(value) => update("listIndent", `${value}px`)}
            onReset={() => update("listIndent", null)}
          />
        </ToolbarMenu>
      ) : null}
    </div>
  );
}
