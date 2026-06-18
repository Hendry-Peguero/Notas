export type Urgency = "overdue" | "today" | "tomorrow" | "future" | "none";

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function dayDiff(isoDate?: string): number | null {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T00:00:00");
  return Math.round((d.getTime() - today().getTime()) / 86_400_000);
}

export function urgencyOf(isoDate?: string): Urgency {
  const diff = dayDiff(isoDate);
  if (diff === null) return "none";
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return "future";
}

export const urgencyColor: Record<Urgency, string> = {
  overdue: "danger",
  today: "danger",
  tomorrow: "warning",
  future: "success",
  none: "text-tertiary",
};

export function dateLabel(isoDate?: string): string {
  const diff = dayDiff(isoDate);
  if (diff === null) return "";
  if (diff < 0) return diff === -1 ? "Ayer" : "Vencido";
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function weekActivity(tasks: { done: boolean; date?: string; createdAt: number }[]) {
  // Lunes a Domingo de la semana actual
  const base = today();
  const dow = (base.getDay() + 6) % 7; // 0 = lunes
  const monday = new Date(base);
  monday.setDate(base.getDate() - dow);
  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  return labels.map((label, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const isoDay = day.toISOString().slice(0, 10);
    const done = tasks.filter((t) => t.done && t.date === isoDay).length;
    const pending = tasks.filter((t) => !t.done && t.date === isoDay).length;
    return { label, done, pending };
  });
}
