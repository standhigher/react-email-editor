import { ColorPicker } from "../../../components/ColorPicker";
import { useColorPicker } from "../../../components/color-picker/useColorPicker";
import { ToolbarButton } from "./ToolbarButton";

interface TextColorControlProps {
  value: string;
  fallback: string;
  onOpen: () => void;
  onChange: (color: string) => void;
  onReset: () => void;
}

export function TextColorControl({ value, fallback, onOpen, onChange, onReset }: TextColorControlProps) {
  const { id, open, anchorRef, panelRef, toggle, close } = useColorPicker(onOpen);

  return (
    <div className="ree-rte-pop" ref={anchorRef}>
      <ToolbarButton
        title="Text color"
        expanded={open}
        controls={open ? id : undefined}
        onClick={toggle}
      >
        <span className="ree-tool-color" style={{ borderBottomColor: value || fallback }}>
          A
        </span>
      </ToolbarButton>
      {open ? <ColorPicker id={id} label="Text color" value={value} fallback={fallback} panelRef={panelRef} onChange={onChange} onReset={onReset} onClose={close} /> : null}
    </div>
  );
}
