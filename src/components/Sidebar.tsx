import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "./Icon";
import { NavItem } from "./NavItem";
import { useGroups, useNotes, useTrashCount, usePendingCount } from "../data/hooks";
import { createGroup, createNote } from "../data/repo";
import { useUI } from "../store/ui";

export function Sidebar() {
  const open = useUI((s) => s.sidebarOpen);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: activeNoteId } = useParams();

  const groups = useGroups();
  const notes = useNotes(); // todas las activas
  const trashCount = useTrashCount();
  const pending = usePendingCount();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (!open) {
    return (
      <button
        onClick={toggleSidebar}
        title="Mostrar barra lateral"
        className="absolute left-3 top-3 z-20 rounded-md p-2 text-text-secondary hover:bg-hover"
      >
        <Icon name="panel-left-open" size={18} />
      </button>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  const newNote = async (groupId: string | null) => {
    const id = await createNote(groupId);
    navigate(`/note/${id}`);
  };

  const addGroup = async () => {
    const name = prompt("Nombre del grupo:");
    if (name?.trim()) await createGroup(name.trim());
  };

  const ungrouped = notes.filter((n) => n.groupId === null);

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-1 border-r border-border bg-sidebar px-2.5 py-3.5">
      {/* Encabezado workspace */}
      <div className="flex items-center gap-2 px-1.5 py-1">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-accent">
          <Icon name="notebook-pen" size={15} className="text-white" />
        </div>
        <span className="flex-1 truncate text-[15px] font-semibold text-text-primary">
          Mis Notas
        </span>
        <button
          onClick={toggleSidebar}
          title="Ocultar barra lateral"
          className="rounded p-1 text-text-tertiary hover:bg-hover hover:text-text-secondary"
        >
          <Icon name="panel-left-close" size={18} />
        </button>
      </div>

      {/* Buscador */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 rounded-[6px] bg-hover px-2.5 py-2 text-text-tertiary transition-colors hover:text-text-secondary"
      >
        <Icon name="search" size={15} />
        <span className="flex-1 text-left text-[13px]">Buscar</span>
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium">
          ⌘K
        </kbd>
      </button>

      <div className="h-2" />

      {/* Acceso rápido */}
      <NavItem
        icon="list-checks"
        label="Pendientes"
        badge={pending}
        active={isActive("/pendientes")}
        onClick={() => navigate("/pendientes")}
      />
      <NavItem
        icon="star"
        label="Favoritos"
        active={isActive("/favoritos")}
        onClick={() => navigate("/favoritos")}
      />
      <NavItem
        icon="calendar-days"
        label="Calendario"
        active={isActive("/calendario")}
        onClick={() => navigate("/calendario")}
      />

      {/* Grupos */}
      <div className="flex items-center justify-between px-2 pb-1 pt-3">
        <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">GRUPOS</span>
        <button
          onClick={addGroup}
          title="Nuevo grupo"
          className="rounded p-0.5 text-text-tertiary hover:bg-hover hover:text-text-secondary"
        >
          <Icon name="plus" size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.map((g) => {
          const groupNotes = notes.filter((n) => n.groupId === g.id);
          const isCollapsed = collapsed[g.id];
          return (
            <div key={g.id}>
              <div className="group flex items-center">
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                  className="flex flex-1 items-center gap-2 rounded-[6px] px-2.5 py-[7px] text-sm font-medium text-text-secondary hover:bg-hover hover:text-text-primary"
                >
                  <Icon
                    name="chevron-right"
                    size={14}
                    className={`shrink-0 text-text-tertiary transition-transform ${
                      isCollapsed ? "" : "rotate-90"
                    }`}
                  />
                  <Icon name={g.icon} size={16} style={{ color: `var(--${g.color})` }} />
                  <span className="flex-1 truncate text-left">{g.name}</span>
                </button>
                <button
                  onClick={() => newNote(g.id)}
                  title="Nueva nota"
                  className="mr-1 rounded p-1 text-text-tertiary opacity-0 hover:bg-hover hover:text-text-secondary group-hover:opacity-100"
                >
                  <Icon name="plus" size={14} />
                </button>
              </div>
              {!isCollapsed &&
                groupNotes.map((n) => (
                  <NavItem
                    key={n.id}
                    icon="file-text"
                    label={`${n.emoji} ${n.title}`}
                    active={activeNoteId === n.id}
                    indent
                    onClick={() => navigate(`/note/${n.id}`)}
                  />
                ))}
            </div>
          );
        })}

        {ungrouped.length > 0 && (
          <div className="pt-1">
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wide text-text-tertiary">
              SIN GRUPO
            </div>
            {ungrouped.map((n) => (
              <NavItem
                key={n.id}
                icon="file-text"
                label={`${n.emoji} ${n.title}`}
                active={activeNoteId === n.id}
                indent
                onClick={() => navigate(`/note/${n.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pie: Papelera */}
      <NavItem
        icon="trash-2"
        label="Papelera"
        badge={trashCount}
        active={isActive("/papelera")}
        onClick={() => navigate("/papelera")}
      />
    </aside>
  );
}
