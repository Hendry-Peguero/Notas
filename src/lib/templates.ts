import { uid } from "../data/db";

export interface TemplateDef {
  key: string;
  name: string;
  emoji: string;
  icon: string;
  build: () => unknown[];
}

const cl = (text: string, checked = false) => ({
  id: uid(),
  type: "checkListItem",
  props: { checked },
  content: text,
});
const h = (text: string, level: 1 | 2 | 3 = 2) => ({
  type: "heading",
  props: { level },
  content: text,
});
const p = (text = "") => ({ type: "paragraph", content: text });
const bullet = (text: string) => ({ type: "bulletListItem", content: text });

export const templates: TemplateDef[] = [
  {
    key: "blank",
    name: "Nota libre",
    emoji: "📝",
    icon: "file-text",
    build: () => [p("")],
  },
  {
    key: "meeting",
    name: "Reunión",
    emoji: "🗓️",
    icon: "users",
    build: () => [
      h("Asistentes", 2),
      bullet(""),
      h("Agenda", 2),
      cl("Punto 1"),
      cl("Punto 2"),
      h("Acuerdos", 2),
      p(""),
      h("Pendientes", 2),
      cl("Tarea de seguimiento"),
    ],
  },
  {
    key: "journal",
    name: "Diario",
    emoji: "📔",
    icon: "book-open",
    build: () => [
      h("Cómo me siento hoy", 2),
      p(""),
      h("Lo que pasó", 2),
      p(""),
      h("Gratitud", 2),
      bullet(""),
    ],
  },
  {
    key: "todo",
    name: "Lista de tareas",
    emoji: "✅",
    icon: "list-checks",
    build: () => [
      h("Por hacer", 2),
      cl("Primera tarea"),
      cl("Segunda tarea"),
      cl("Tercera tarea"),
    ],
  },
];
