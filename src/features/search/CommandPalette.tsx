import { useMemo, useState } from "react";
import { Command } from "cmdk";
import MiniSearch from "minisearch";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useGroups, useNotes } from "../../data/hooks";
import { createNote } from "../../data/repo";
import { useUI } from "../../store/ui";

function blocksToText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const read = (c: unknown): string => {
    if (typeof c === "string") return c;
    if (Array.isArray(c))
      return c.map((x) => (x && typeof x === "object" && "text" in x ? (x as { text: string }).text : "")).join(" ");
    return "";
  };
  return blocks.map((b) => read((b as { content?: unknown })?.content)).join(" ");
}

export function CommandPalette() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const notes = useNotes();
  const groups = useGroups();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const index = useMemo(() => {
    const ms = new MiniSearch({
      fields: ["title", "text"],
      storeFields: ["title", "emoji", "groupId"],
      searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
    });
    ms.addAll(notes.map((n) => ({ id: n.id, title: n.title, emoji: n.emoji, text: blocksToText(n.blocks) })));
    return ms;
  }, [notes]);

  if (!open) return null;

  const results = query.trim()
    ? index.search(query).slice(0, 8)
    : notes.slice(0, 6).map((n) => ({ id: n.id, title: n.title, emoji: n.emoji, groupId: n.groupId }));

  const go = (fn: () => void) => {
    fn();
    setOpen(false);
    setQuery("");
  };

  const groupName = (gid: unknown) => groups.find((g) => g.id === gid)?.name ?? "Sin grupo";

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-black/40 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        shouldFilter={false}
        loop
        onClick={(e) => e.stopPropagation()}
        className="h-fit w-[600px] max-w-[92vw] overflow-hidden rounded-[10px] border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Icon name="search" size={19} className="text-text-tertiary" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar notas o ejecutar un comando…"
            className="flex-1 bg-transparent text-[16px] text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <kbd className="rounded bg-hover px-2 py-0.5 text-[11px] font-medium text-text-tertiary">ESC</kbd>
        </div>

        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-text-tertiary">
            Sin resultados.
          </Command.Empty>

          <Command.Group heading="Resultados" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-text-tertiary">
            {results.map((r) => (
              <Command.Item
                key={r.id}
                value={`note-${r.id}`}
                onSelect={() => go(() => navigate(`/note/${r.id}`))}
                className="flex cursor-pointer items-center gap-3 rounded-[6px] px-3 py-2.5 data-[selected=true]:bg-accent-soft"
              >
                <span>{(r as { emoji?: string }).emoji ?? "📄"}</span>
                <span className="flex-1 truncate text-sm font-medium text-text-primary">
                  {(r as { title: string }).title}
                </span>
                <span className="rounded-full bg-hover px-2 py-0.5 text-[11.5px] font-medium text-text-secondary">
                  {groupName((r as { groupId?: unknown }).groupId)}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Acciones" className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-text-tertiary">
            <Action icon="plus" label="Nueva nota" onSelect={() => go(async () => navigate(`/note/${await createNote(null)}`))} />
            <Action icon="list-checks" label="Ir a Pendientes" onSelect={() => go(() => navigate("/pendientes"))} />
            <Action icon="calendar-days" label="Ir a Calendario" onSelect={() => go(() => navigate("/calendario"))} />
            <Action icon="sun-moon" label="Cambiar tema claro/oscuro" onSelect={() => go(toggleTheme)} />
          </Command.Group>
        </Command.List>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[12px] text-text-tertiary">
          <Hint keys="↑↓" label="navegar" />
          <Hint keys="↵" label="abrir" />
          <Hint keys="ESC" label="cerrar" />
        </div>
      </Command>
    </div>
  );
}

function Action({ icon, label, onSelect }: { icon: string; label: string; onSelect: () => void }) {
  return (
    <Command.Item
      value={`action-${label}`}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-[6px] px-3 py-2.5 data-[selected=true]:bg-accent-soft"
    >
      <Icon name={icon} size={16} className="text-text-secondary" />
      <span className="text-sm text-text-primary">{label}</span>
    </Command.Item>
  );
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="rounded bg-hover px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary">{keys}</kbd>
      {label}
    </span>
  );
}
