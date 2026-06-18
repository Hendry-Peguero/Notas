import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useFavorites, useGroups } from "../../data/hooks";

export function FavoritesView() {
  const favorites = useFavorites();
  const groups = useGroups();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-7 py-4 pl-12">
        <h1 className="text-xl font-bold text-text-primary">Favoritos</h1>
        <p className="text-[13px] text-text-secondary">Tus notas marcadas con estrella</p>
      </div>
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.length === 0 && (
            <p className="text-[13px] text-text-tertiary">Aún no tienes favoritos.</p>
          )}
          {favorites.map((n) => {
            const group = groups.find((g) => g.id === n.groupId);
            return (
              <button
                key={n.id}
                onClick={() => navigate(`/note/${n.id}`)}
                className="rounded-[10px] border border-border bg-card p-4 text-left transition-colors hover:border-accent"
              >
                <div className="mb-2 text-2xl">{n.emoji}</div>
                <div className="truncate font-medium text-text-primary">{n.title}</div>
                <div className="mt-1 flex items-center gap-1 text-[12px] text-text-tertiary">
                  <Icon name="folder" size={12} />
                  {group?.name ?? "Sin grupo"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
