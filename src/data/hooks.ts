import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

export function useGroups() {
  return useLiveQuery(() => db.groups.orderBy("order").toArray(), [], []);
}

export function useTags() {
  return useLiveQuery(() => db.tags.toArray(), [], []);
}

/** Notas activas (no en papelera), opcionalmente filtradas por grupo. */
export function useNotes(groupId?: string | null) {
  return useLiveQuery(
    () =>
      db.notes
        .filter((n) => !n.trashed && (groupId === undefined || n.groupId === groupId))
        .reverse()
        .sortBy("updatedAt"),
    [groupId],
    []
  );
}

export function useFavorites() {
  return useLiveQuery(() => db.notes.filter((n) => n.favorite && !n.trashed).toArray(), [], []);
}

export function useNote(id: string | undefined) {
  return useLiveQuery(() => (id ? db.notes.get(id) : undefined), [id]);
}

export function useTrashedNotes() {
  return useLiveQuery(() => db.notes.filter((n) => n.trashed).reverse().sortBy("trashedAt"), [], []);
}

export function useTasks() {
  return useLiveQuery(() => db.tasks.toArray(), [], []);
}

export function useVersions(noteId: string | undefined) {
  return useLiveQuery(
    () => (noteId ? db.versions.where("noteId").equals(noteId).reverse().sortBy("createdAt") : []),
    [noteId],
    []
  );
}

export function useTrashCount() {
  return useLiveQuery(() => db.notes.filter((n) => n.trashed).count(), [], 0);
}

export function usePendingCount() {
  return useLiveQuery(() => db.tasks.filter((t) => !t.done).count(), [], 0);
}
