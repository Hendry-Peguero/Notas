import { Icon } from "../../components/Icon";
import { useTrashedNotes } from "../../data/hooks";
import { deleteForever, emptyTrash, restoreNote } from "../../data/repo";

export function TrashView() {
  const trashed = useTrashedNotes();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-7 py-4 pl-12">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Papelera</h1>
          <p className="text-[13px] text-text-secondary">
            Las notas se pueden restaurar antes de borrarse definitivamente
          </p>
        </div>
        {trashed.length > 0 && (
          <button
            onClick={() => {
              if (confirm("¿Vaciar la papelera permanentemente?")) emptyTrash();
            }}
            className="rounded-md bg-danger px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Vaciar papelera
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="mx-auto max-w-[800px]">
          {trashed.length === 0 && (
            <p className="py-10 text-center text-[13px] text-text-tertiary">La papelera está vacía.</p>
          )}
          {trashed.map((n) => (
            <div
              key={n.id}
              className="mb-2 flex items-center gap-3 rounded-[8px] border border-border bg-card px-4 py-3"
            >
              <span className="text-xl">{n.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-text-primary">{n.title}</div>
                {n.trashedAt && (
                  <div className="text-[12px] text-text-tertiary">
                    Eliminada el{" "}
                    {new Date(n.trashedAt).toLocaleDateString("es", { day: "numeric", month: "short" })}
                  </div>
                )}
              </div>
              <button
                onClick={() => restoreNote(n.id)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-accent hover:bg-accent-soft"
              >
                <Icon name="rotate-ccw" size={14} /> Restaurar
              </button>
              <button
                onClick={() => {
                  if (confirm("¿Borrar definitivamente esta nota?")) deleteForever(n.id);
                }}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-danger hover:bg-hover"
              >
                <Icon name="trash-2" size={14} /> Borrar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
