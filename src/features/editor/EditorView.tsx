import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useGroups, useNote, useTags } from "../../data/hooks";
import { patchNote, toggleFavorite, trashNote } from "../../data/repo";
import { useUI } from "../../store/ui";
import { downloadMarkdown, exportPdf } from "../../lib/export";
import { dateLabel } from "../../lib/dates";
import { NoteEditor } from "./NoteEditor";
import { EmojiPicker } from "./EmojiPicker";
import { VersionsPanel } from "./VersionsPanel";

export function EditorView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const note = useNote(id);
  const groups = useGroups();
  const tags = useTags();
  const saving = useUI((s) => s.savingState);
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [menuOpen, setMenuOpen] = useState<"export" | "tags" | "group" | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center text-text-tertiary">
        Selecciona o crea una nota.
      </div>
    );
  }

  const group = groups.find((g) => g.id === note.groupId);

  const onExportMd = async () => {
    const getMd = (window as unknown as { __getMarkdown?: () => Promise<string> }).__getMarkdown;
    const md = getMd ? await getMd() : "";
    downloadMarkdown(note, md);
    setMenuOpen(null);
  };

  return (
    <div className="flex h-full min-w-0 flex-1">
      <div className="flex h-full min-w-0 flex-1 flex-col bg-canvas">
        {/* Barra de contexto */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-2.5">
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <span className="font-medium text-text-secondary">{group?.name ?? "Sin grupo"}</span>
            <Icon name="chevron-right" size={14} className="text-text-tertiary" />
            <span className="truncate font-medium text-text-primary">{note.title}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-tertiary">
            {saving === "saving" && <span>Guardando…</span>}
            {saving === "saved" && (
              <span className="flex items-center gap-1 text-success">
                <Icon name="check" size={14} /> Guardado
              </span>
            )}
          </div>

          <IconButton title="Favorito" onClick={() => toggleFavorite(note.id)}>
            <Icon
              name="star"
              size={17}
              className={note.favorite ? "fill-warning text-warning" : "text-text-secondary"}
            />
          </IconButton>
          <IconButton title="Historial" onClick={() => setShowVersions((v) => !v)}>
            <Icon name="history" size={17} className="text-text-secondary" />
          </IconButton>
          <IconButton
            title="Compartir"
            onClick={() => navigator.clipboard?.writeText(location.href)}
          >
            <Icon name="share-2" size={17} className="text-text-secondary" />
          </IconButton>
          <div className="relative">
            <IconButton title="Más" onClick={() => setMenuOpen(menuOpen === "export" ? null : "export")}>
              <Icon name="ellipsis" size={17} className="text-text-secondary" />
            </IconButton>
            {menuOpen === "export" && (
              <Dropdown onClose={() => setMenuOpen(null)}>
                <DropItem icon="file-down" label="Exportar Markdown" onClick={onExportMd} />
                <DropItem icon="printer" label="Exportar PDF" onClick={() => { exportPdf(); setMenuOpen(null); }} />
                <div className="my-1 border-t border-border" />
                <DropItem
                  icon="trash-2"
                  label="Mover a papelera"
                  onClick={async () => {
                    await trashNote(note.id);
                    setMenuOpen(null);
                    navigate("/pendientes");
                  }}
                />
              </Dropdown>
            )}
          </div>
          <IconButton title="Tema" onClick={toggleTheme}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} className="text-text-secondary" />
          </IconButton>
        </div>

        {/* Superficie del editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[760px] px-6 pb-32 pt-11">
            {/* Encabezado de nota */}
            <div className="relative">
              <button onClick={() => setEmojiOpen((o) => !o)} className="rounded-lg text-5xl leading-none hover:bg-hover">
                {note.emoji}
              </button>
              {emojiOpen && (
                <EmojiPicker
                  onPick={(e) => patchNote(note.id, { emoji: e })}
                  onClose={() => setEmojiOpen(false)}
                />
              )}
            </div>

            <input
              value={note.title}
              onChange={(e) => patchNote(note.id, { title: e.target.value })}
              placeholder="Sin título"
              className="mt-3 w-full bg-transparent text-[34px] font-bold text-text-primary outline-none placeholder:text-text-tertiary"
            />

            {/* Metadatos */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => dateRef.current?.showPicker?.()}
                className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-medium text-accent"
              >
                <Icon name="calendar" size={12} />
                {note.date ? dateLabel(note.date) : "Agregar fecha"}
                <input
                  ref={dateRef}
                  type="date"
                  value={note.date ?? ""}
                  onChange={(e) => patchNote(note.id, { date: e.target.value || undefined })}
                  className="sr-only"
                />
              </button>

              {note.tagIds.map((tid) => {
                const tag = tags.find((t) => t.id === tid);
                if (!tag) return null;
                return (
                  <span
                    key={tid}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
                    style={{ color: `var(--${tag.color})`, background: `color-mix(in srgb, var(--${tag.color}) 13%, transparent)` }}
                  >
                    <Icon name="tag" size={11} />
                    {tag.name}
                  </span>
                );
              })}

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === "tags" ? null : "tags")}
                  className="flex items-center gap-1 rounded-full bg-hover px-2.5 py-1 text-[12px] font-medium text-text-secondary"
                >
                  <Icon name="plus" size={12} /> Etiqueta
                </button>
                {menuOpen === "tags" && (
                  <Dropdown onClose={() => setMenuOpen(null)}>
                    {tags.map((t) => {
                      const has = note.tagIds.includes(t.id);
                      return (
                        <DropItem
                          key={t.id}
                          icon={has ? "check" : "tag"}
                          label={t.name}
                          onClick={() =>
                            patchNote(note.id, {
                              tagIds: has
                                ? note.tagIds.filter((x) => x !== t.id)
                                : [...note.tagIds, t.id],
                            })
                          }
                        />
                      );
                    })}
                  </Dropdown>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === "group" ? null : "group")}
                  className="flex items-center gap-1.5 rounded-full bg-hover px-2.5 py-1 text-[12px] font-medium text-text-secondary"
                >
                  <Icon name="folder" size={12} />
                  {group?.name ?? "Sin grupo"}
                </button>
                {menuOpen === "group" && (
                  <Dropdown onClose={() => setMenuOpen(null)}>
                    {groups.map((g) => (
                      <DropItem
                        key={g.id}
                        icon="folder"
                        label={g.name}
                        onClick={() => patchNote(note.id, { groupId: g.id })}
                      />
                    ))}
                    <DropItem icon="folder-minus" label="Sin grupo" onClick={() => patchNote(note.id, { groupId: null })} />
                  </Dropdown>
                )}
              </div>
            </div>

            {/* Editor de bloques */}
            <div className="mt-6 -ml-[54px]">
              <NoteEditor key={note.id} note={note} />
            </div>
          </div>
        </div>
      </div>

      {showVersions && <VersionsPanel noteId={note.id} onClose={() => setShowVersions(false)} />}
    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-hover"
    >
      {children}
    </button>
  );
}

function Dropdown({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 z-40 mt-1 min-w-[200px] rounded-[10px] border border-border bg-card p-1.5 shadow-xl">
        {children}
      </div>
    </>
  );
}

function DropItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-text-primary hover:bg-hover"
    >
      <Icon name={icon} size={15} className="text-text-secondary" />
      {label}
    </button>
  );
}
