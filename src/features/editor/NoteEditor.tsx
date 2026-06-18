import { useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { Note } from "../../data/db";
import { saveNoteContent } from "../../data/repo";
import { useUI } from "../../store/ui";
import { FormatMenu } from "./FormatMenu";

interface Props {
  note: Note;
}

export function NoteEditor({ note }: Props) {
  const theme = useUI((s) => s.theme);
  const setSaving = useUI((s) => s.setSaving);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const initialContent = useMemo(() => {
    const b = note.blocks as unknown[];
    return Array.isArray(b) && b.length ? (b as never) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editor = useCreateBlockNote({ initialContent });

  // Exponer markdown para el botón de export
  useEffect(() => {
    (window as unknown as { __getMarkdown?: () => Promise<string> }).__getMarkdown = () =>
      Promise.resolve(editor.blocksToMarkdownLossy(editor.document));
    return () => {
      delete (window as unknown as { __getMarkdown?: unknown }).__getMarkdown;
    };
  }, [editor]);

  const handleChange = () => {
    setSaving("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveNoteContent(note.id, { blocks: editor.document });
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 2000);
    }, 800);
  };

  return (
    <div
      className="relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={handleChange}
        data-theming-css-variables-demo
      />
      {menu && (
        <FormatMenu editor={editor} x={menu.x} y={menu.y} onClose={() => setMenu(null)} />
      )}
    </div>
  );
}
