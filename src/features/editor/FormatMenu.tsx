import { useEffect, useRef } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import { Icon } from "../../components/Icon";

interface Props {
  editor: BlockNoteEditor;
  x: number;
  y: number;
  onClose: () => void;
}

export function FormatMenu({ editor, x, y, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const setType = (type: string, props?: Record<string, unknown>) => {
    const block = editor.getTextCursorPosition().block;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.updateBlock(block, { type, props } as any);
    editor.focus();
    onClose();
  };

  const toggle = (style: "bold" | "italic" | "underline") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.toggleStyles({ [style]: true } as any);
    editor.focus();
    onClose();
  };

  // Mantener el menú dentro de la ventana
  const left = Math.min(x, window.innerWidth - 270);
  const top = Math.min(y, window.innerHeight - 380);

  const Item = ({
    icon,
    label,
    kbd,
    onClick,
  }: {
    icon: string;
    label: string;
    kbd?: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-[13.5px] text-text-primary hover:bg-hover"
    >
      <Icon name={icon} size={16} className="text-text-secondary" />
      <span className="flex-1">{label}</span>
      {kbd && <span className="text-[11.5px] text-text-tertiary">{kbd}</span>}
    </button>
  );

  const Label = ({ children }: { children: string }) => (
    <div className="px-2 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-text-tertiary">
      {children}
    </div>
  );

  return (
    <div
      ref={ref}
      style={{ left, top }}
      className="fixed z-50 w-[252px] rounded-[10px] border border-border bg-card p-1.5 shadow-2xl"
    >
      <Label>ENCABEZADOS</Label>
      <Item icon="heading-1" label="Título" kbd="# " onClick={() => setType("heading", { level: 1 })} />
      <Item icon="heading-2" label="Subtítulo" kbd="## " onClick={() => setType("heading", { level: 2 })} />
      <Item icon="heading-3" label="Sección" kbd="### " onClick={() => setType("heading", { level: 3 })} />
      <Item icon="pilcrow" label="Texto normal" onClick={() => setType("paragraph")} />
      <div className="my-1 border-t border-border" />
      <Label>LISTAS</Label>
      <Item icon="list" label="Lista de puntos" kbd="- " onClick={() => setType("bulletListItem")} />
      <Item icon="list-ordered" label="Lista numerada" kbd="1." onClick={() => setType("numberedListItem")} />
      <Item icon="list-checks" label="Tarea / checkbox" kbd="[]" onClick={() => setType("checkListItem")} />
      <div className="my-1 border-t border-border" />
      <Label>FORMATO</Label>
      <Item icon="bold" label="Negrita" kbd="⌘B" onClick={() => toggle("bold")} />
      <Item icon="italic" label="Cursiva" kbd="⌘I" onClick={() => toggle("italic")} />
      <Item icon="underline" label="Subrayado" kbd="⌘U" onClick={() => toggle("underline")} />
    </div>
  );
}
