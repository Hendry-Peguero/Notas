import { useEffect, useRef } from "react";

const EMOJIS = [
  "📝", "📄", "📌", "✅", "🗓️", "💡", "🚀", "🔥", "⭐", "🎯",
  "📊", "📈", "🤝", "💬", "📔", "🛒", "🏠", "💼", "🎨", "🧠",
  "❤️", "⚡", "🌱", "🍎", "☕", "🎵", "🔧", "📦", "🧩", "🏷️",
];

interface Props {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-40 mt-1 grid w-[280px] grid-cols-8 gap-1 rounded-[10px] border border-border bg-card p-2 shadow-xl"
    >
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => {
            onPick(e);
            onClose();
          }}
          className="rounded-md p-1 text-xl hover:bg-hover"
        >
          {e}
        </button>
      ))}
    </div>
  );
}
