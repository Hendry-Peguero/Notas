import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useNotes, useTasks } from "../../data/hooks";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DOW = ["L", "M", "X", "J", "V", "S", "D"];

export function CalendarView() {
  const notes = useNotes();
  const tasks = useTasks();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);

  const todayIso = new Date().toISOString().slice(0, 10);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startDow = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      arr.push(iso);
    }
    return arr;
  }, [cursor]);

  const datesWithContent = useMemo(() => {
    const s = new Set<string>();
    notes.forEach((n) => n.date && s.add(n.date));
    tasks.forEach((t) => t.date && s.add(t.date));
    return s;
  }, [notes, tasks]);

  const move = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const dayNotes = selected ? notes.filter((n) => n.date === selected) : [];
  const dayTasks = selected ? tasks.filter((t) => t.date === selected) : [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border px-7 py-4 pl-12">
        <h1 className="text-xl font-bold text-text-primary">
          {MONTHS[cursor.month]} {cursor.year}
        </h1>
        <div className="flex gap-1">
          <button onClick={() => move(-1)} className="rounded-md p-1.5 hover:bg-hover">
            <Icon name="chevron-left" size={18} className="text-text-secondary" />
          </button>
          <button onClick={() => move(1)} className="rounded-md p-1.5 hover:bg-hover">
            <Icon name="chevron-right" size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-2 grid grid-cols-7 gap-2">
            {DOW.map((d) => (
              <div key={d} className="text-center text-[12px] font-semibold text-text-tertiary">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((iso, i) => {
              if (!iso) return <div key={i} />;
              const day = Number(iso.slice(-2));
              const isToday = iso === todayIso;
              const isSel = iso === selected;
              const has = datesWithContent.has(iso);
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-[8px] border text-sm transition-colors ${
                    isSel ? "border-accent bg-accent-soft" : "border-border hover:bg-hover"
                  }`}
                >
                  <span className={isToday ? "font-bold text-accent" : "text-text-primary"}>{day}</span>
                  {has && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="w-[300px] shrink-0 overflow-y-auto border-l border-border bg-sidebar p-4">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">
              {new Date(selected + "T00:00:00").toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            {dayNotes.length === 0 && dayTasks.length === 0 && (
              <p className="text-[13px] text-text-tertiary">Nada para este día.</p>
            )}
            {dayNotes.map((n) => (
              <button
                key={n.id}
                onClick={() => navigate(`/note/${n.id}`)}
                className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-hover"
              >
                <span>{n.emoji}</span>
                <span className="flex-1 truncate text-[13px] text-text-primary">{n.title}</span>
              </button>
            ))}
            {dayTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 text-[13px]">
                <Icon
                  name={t.done ? "check-circle" : "circle"}
                  size={14}
                  className={t.done ? "text-success" : "text-text-tertiary"}
                />
                <span className={t.done ? "text-text-tertiary line-through" : "text-text-secondary"}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
