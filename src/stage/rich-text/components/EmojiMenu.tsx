import { EMOJIS } from "../constants";

interface EmojiMenuProps {
  onPick: (emoji: string) => void;
}

export function EmojiMenu({ onPick }: EmojiMenuProps) {
  return (
    <div className="ree-rte-emoji-grid">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="ree-rte-emoji"
          title={emoji}
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
