import { db, type Note, type Task } from "./db";

interface BlockLike {
  id: string;
  type: string;
  props?: { checked?: boolean };
  content?: unknown;
}

function inlineText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (c && typeof c === "object" && "text" in c ? (c as { text: string }).text : ""))
      .join("");
  }
  return "";
}

/** Recorre los bloques de una nota y sincroniza sus checkboxes con la tabla `tasks`. */
export async function syncTasksFromNote(note: Note): Promise<void> {
  const blocks = (note.blocks as BlockLike[]) ?? [];
  const checks = blocks.filter((b) => b?.type === "checkListItem");
  const seenIds = new Set(checks.map((b) => b.id));

  const existing = await db.tasks.where("noteId").equals(note.id).toArray();
  const existingById = new Map(existing.map((t) => [t.id, t]));

  // Eliminar tareas cuyos checkboxes ya no existen
  const toDelete = existing.filter((t) => !seenIds.has(t.id)).map((t) => t.id);
  if (toDelete.length) await db.tasks.bulkDelete(toDelete);

  // Upsert (preserva fecha y createdAt)
  const upserts: Task[] = checks.map((b) => {
    const prev = existingById.get(b.id);
    return {
      id: b.id,
      noteId: note.id,
      text: inlineText(b.content) || "Sin título",
      done: !!b.props?.checked,
      date: prev?.date ?? note.date,
      createdAt: prev?.createdAt ?? Date.now(),
    };
  });
  if (upserts.length) await db.tasks.bulkPut(upserts);
}
