import { db, uid, type Note } from "./db";
import { syncTasksFromNote } from "./tasks";

const VERSION_INTERVAL = 60_000; // 1 min entre snapshots
const MAX_VERSIONS = 30;

export async function createNote(
  groupId: string | null,
  opts?: { title?: string; emoji?: string; blocks?: unknown[] }
): Promise<string> {
  const now = Date.now();
  const note: Note = {
    id: uid(),
    groupId,
    emoji: opts?.emoji ?? "📄",
    title: opts?.title ?? "Sin título",
    blocks: opts?.blocks ?? [{ type: "paragraph", content: "" }],
    tagIds: [],
    favorite: false,
    trashed: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  await syncTasksFromNote(note);
  return note.id;
}

export async function saveNoteContent(
  id: string,
  patch: { title?: string; blocks?: unknown[]; emoji?: string }
): Promise<void> {
  const note = await db.notes.get(id);
  if (!note) return;

  // Snapshot de versión si pasó el intervalo
  if (patch.blocks) {
    const last = await db.versions.where("noteId").equals(id).reverse().sortBy("createdAt");
    const shouldSnapshot = !last.length || Date.now() - last[0].createdAt > VERSION_INTERVAL;
    if (shouldSnapshot) {
      await db.versions.add({
        id: uid(),
        noteId: id,
        blocks: note.blocks,
        title: note.title,
        createdAt: Date.now(),
      });
      const all = await db.versions.where("noteId").equals(id).sortBy("createdAt");
      if (all.length > MAX_VERSIONS) {
        await db.versions.bulkDelete(all.slice(0, all.length - MAX_VERSIONS).map((v) => v.id));
      }
    }
  }

  const updated: Note = { ...note, ...patch, updatedAt: Date.now() };
  await db.notes.put(updated);
  if (patch.blocks) await syncTasksFromNote(updated);
}

export async function patchNote(id: string, patch: Partial<Note>): Promise<void> {
  await db.notes.update(id, { ...patch, updatedAt: Date.now() });
}

export async function toggleFavorite(id: string): Promise<void> {
  const n = await db.notes.get(id);
  if (n) await db.notes.update(id, { favorite: !n.favorite });
}

export async function trashNote(id: string): Promise<void> {
  await db.notes.update(id, { trashed: true, trashedAt: Date.now() });
  await db.tasks.where("noteId").equals(id).delete();
}

export async function restoreNote(id: string): Promise<void> {
  const n = await db.notes.get(id);
  if (!n) return;
  await db.notes.update(id, { trashed: false, trashedAt: undefined });
  await syncTasksFromNote({ ...n, trashed: false });
}

export async function deleteForever(id: string): Promise<void> {
  await db.notes.delete(id);
  await db.tasks.where("noteId").equals(id).delete();
  await db.versions.where("noteId").equals(id).delete();
}

export async function restoreVersion(versionId: string): Promise<void> {
  const v = await db.versions.get(versionId);
  if (!v) return;
  await saveNoteContent(v.noteId, { blocks: v.blocks as unknown[] });
}

// ---- Grupos ----
export async function createGroup(name: string): Promise<string> {
  const max = await db.groups.orderBy("order").last();
  const id = uid();
  await db.groups.add({
    id,
    name,
    icon: "folder",
    color: "accent",
    order: (max?.order ?? -1) + 1,
  });
  return id;
}

export async function renameGroup(id: string, name: string): Promise<void> {
  await db.groups.update(id, { name });
}

export async function deleteGroup(id: string): Promise<void> {
  // Mueve las notas a "Sin grupo" antes de borrar
  await db.notes.where("groupId").equals(id).modify({ groupId: null });
  await db.groups.delete(id);
}

export async function setTaskDone(taskId: string, done: boolean): Promise<void> {
  const t = await db.tasks.get(taskId);
  if (!t) return;
  await db.tasks.update(taskId, { done });
  // Refleja el cambio en el bloque de la nota
  const note = await db.notes.get(t.noteId);
  if (note) {
    const blocks = (note.blocks as { id: string; props?: { checked?: boolean } }[]) ?? [];
    const block = blocks.find((b) => b.id === taskId);
    if (block) {
      block.props = { ...block.props, checked: done };
      await db.notes.update(t.noteId, { blocks, updatedAt: Date.now() });
    }
  }
}

export async function emptyTrash(): Promise<void> {
  const ids = (await db.notes.filter((n) => n.trashed).toArray()).map((n) => n.id);
  await Promise.all(ids.map(deleteForever));
}
