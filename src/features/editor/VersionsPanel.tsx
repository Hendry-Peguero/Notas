import { Icon } from "../../components/Icon";
import { useVersions } from "../../data/hooks";
import { restoreVersion } from "../../data/repo";

interface Props {
  noteId: string;
  onClose: () => void;
}

export function VersionsPanel({ noteId, onClose }: Props) {
  const versions = useVersions(noteId);

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">Historial de versiones</span>
        <button onClick={onClose} className="rounded p-1 text-text-tertiary hover:bg-hover">
          <Icon name="x" size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {versions.length === 0 && (
          <p className="px-2 py-3 text-[13px] text-text-tertiary">
            Aún no hay versiones guardadas. Se crean automáticamente al editar.
          </p>
        )}
        {versions.map((v) => (
          <div
            key={v.id}
            className="mb-1 flex items-center gap-2 rounded-md px-2 py-2 hover:bg-hover"
          >
            <Icon name="history" size={15} className="text-text-tertiary" />
            <span className="flex-1 text-[13px] text-text-secondary">
              {new Date(v.createdAt).toLocaleString("es", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={() => restoreVersion(v.id)}
              className="rounded px-2 py-1 text-[12px] font-medium text-accent hover:bg-accent-soft"
            >
              Restaurar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
