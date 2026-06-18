import { db, uid, type Group, type Note, type Tag } from "./db";
import { syncTasksFromNote } from "./tasks";

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const cl = (text: string, checked = false) => ({
  id: uid(),
  type: "checkListItem",
  props: { checked },
  content: text,
});
const h = (text: string, level: 1 | 2 | 3 = 2) => ({ type: "heading", props: { level }, content: text });
const p = (text: string) => ({ type: "paragraph", content: text });
const bullet = (text: string) => ({ type: "bulletListItem", content: text });

export async function ensureSeed(): Promise<void> {
  const count = await db.notes.count();
  if (count > 0) return;

  const groups: Group[] = [
    { id: "g-trabajo", name: "Trabajo", icon: "briefcase", color: "purple", order: 0 },
    { id: "g-personal", name: "Personal", icon: "user-round", color: "success", order: 1 },
    { id: "g-ideas", name: "Ideas", icon: "lightbulb", color: "warning", order: 2 },
  ];

  const tags: Tag[] = [
    { id: "t-urgente", name: "Urgente", color: "danger" },
    { id: "t-q3", name: "Q3", color: "purple" },
    { id: "t-diseno", name: "Diseño", color: "accent" },
  ];

  const now = Date.now();
  const notes: Note[] = [
    {
      id: "n-reunion",
      groupId: "g-trabajo",
      emoji: "📝",
      title: "Reunión semanal de equipo",
      tagIds: ["t-urgente", "t-q3"],
      date: iso(0),
      favorite: true,
      trashed: false,
      createdAt: now,
      updatedAt: now,
      blocks: [
        p("Notas y acuerdos de la reunión semanal. Revisamos el avance del trimestre y definimos las prioridades para los próximos días."),
        h("Pendientes de la semana", 2),
        cl("Cerrar propuesta de diseño", true),
        cl("Enviar reporte a finanzas", true),
        cl("Preparar demo para el cliente", false),
        cl("Llamar al proveedor de hosting", false),
        h("Notas adicionales", 3),
        bullet("El equipo de marketing necesita los assets antes del viernes."),
        bullet("Programar seguimiento con el cliente para la próxima semana."),
      ],
    },
    {
      id: "n-acme",
      groupId: "g-trabajo",
      emoji: "🤝",
      title: "Reunión con cliente Acme",
      tagIds: ["t-q3"],
      date: iso(1),
      favorite: false,
      trashed: false,
      createdAt: now - 1000,
      updatedAt: now - 1000,
      blocks: [
        p("Preparar propuesta y presupuesto para Q3."),
        cl("Revisar diseño de onboarding", false),
        cl("Escribir documentación de la API", false),
      ],
    },
    {
      id: "n-ideas",
      groupId: "g-ideas",
      emoji: "💡",
      title: "Ideas para reunión de producto",
      tagIds: ["t-diseno"],
      date: iso(7),
      favorite: false,
      trashed: false,
      createdAt: now - 2000,
      updatedAt: now - 2000,
      blocks: [
        p("Roadmap, nuevas features y feedback de usuarios."),
        cl("Planificar sprint del próximo mes", false),
      ],
    },
    {
      id: "n-compra",
      groupId: "g-personal",
      emoji: "🛒",
      title: "Lista de la compra",
      tagIds: [],
      date: undefined,
      favorite: false,
      trashed: false,
      createdAt: now - 3000,
      updatedAt: now - 3000,
      blocks: [h("Supermercado", 2), cl("Frutas y verduras", true), cl("Café", false)],
    },
  ];

  await db.groups.bulkAdd(groups);
  await db.tags.bulkAdd(tags);
  await db.notes.bulkAdd(notes);

  for (const n of notes) await syncTasksFromNote(n);

  // Fechas demo por urgencia para la vista de Pendientes
  const dueByText: Record<string, string> = {
    "Llamar al proveedor de hosting": iso(-1),
    "Preparar demo para el cliente": iso(0),
    "Revisar diseño de onboarding": iso(1),
    "Escribir documentación de la API": iso(3),
    "Planificar sprint del próximo mes": iso(7),
  };
  const allTasks = await db.tasks.toArray();
  for (const t of allTasks) {
    if (dueByText[t.text]) await db.tasks.update(t.id, { date: dueByText[t.text] });
  }
}
