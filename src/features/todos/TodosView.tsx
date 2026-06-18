import { useState } from "react";
import { MetricCard } from "../../components/MetricCard";
import { TaskRow } from "../../components/TaskRow";
import { useTasks } from "../../data/hooks";
import { setTaskDone } from "../../data/repo";
import { weekActivity } from "../../lib/dates";

export function TodosView() {
  const tasks = useTasks();
  const [tab, setTab] = useState<"pending" | "done">("pending");

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const total = tasks.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const week = weekActivity(tasks);
  const maxBar = Math.max(1, ...week.map((d) => Math.max(d.done, d.pending)));

  const sortByDate = (a: { date?: string }, b: { date?: string }) =>
    (a.date ?? "9999").localeCompare(b.date ?? "9999");

  const list = (tab === "pending" ? pending : done).slice().sort(sortByDate);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-7 py-4 pl-12">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Pendientes</h1>
          <p className="text-[13px] text-text-secondary">Todas tus tareas en un solo lugar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="mx-auto max-w-[1100px]">
          {/* Métricas */}
          <div className="flex gap-4">
            <MetricCard icon="circle-dashed" label="Pendientes" value={pending.length} color="danger" />
            <MetricCard icon="circle-check-big" label="Completadas" value={done.length} color="success" />
            <MetricCard icon="trending-up" label="Progreso" value={`${pct}%`} color="text-primary" />
          </div>

          {/* Barra de progreso */}
          <div className="mt-5 rounded-[10px] border border-border bg-card p-[18px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Progreso general</span>
              <span className="text-sm font-bold text-success">{pct}%</span>
            </div>
            <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-hover">
              <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Gráfico semanal */}
          <div className="mt-5 rounded-[10px] border border-border bg-card p-[18px]">
            <div className="flex items-center gap-4">
              <span className="flex-1 text-sm font-semibold text-text-primary">Actividad semanal</span>
              <Legend color="success" label="Completadas" />
              <Legend color="purple" label="Pendientes" />
            </div>
            <div className="mt-5 flex h-[150px] items-end justify-between px-2">
              {week.map((d) => (
                <div key={d.label} className="flex h-full flex-col items-center justify-end gap-2.5">
                  <div className="flex items-end gap-1">
                    <Bar value={d.done} max={maxBar} color="success" />
                    <Bar value={d.pending} max={maxBar} color="purple" />
                  </div>
                  <span className="text-[12px] font-medium text-text-secondary">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pestañas + lista */}
          <div className="mt-6">
            <div className="flex gap-1 border-b border-border">
              <Tab label="Pendientes" active={tab === "pending"} onClick={() => setTab("pending")} />
              <Tab label="Completadas" active={tab === "done"} onClick={() => setTab("done")} />
            </div>
            <div className="pt-2">
              {list.length === 0 && (
                <p className="px-3 py-6 text-center text-[13px] text-text-tertiary">
                  No hay tareas {tab === "pending" ? "pendientes" : "completadas"}.
                </p>
              )}
              {list.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={(done) => setTaskDone(t.id, done)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const h = value === 0 ? 3 : Math.max(6, Math.round((value / max) * 120));
  return (
    <div
      className="w-[15px] rounded-t-[3px]"
      style={{ height: h, background: `var(--${color})`, opacity: value === 0 ? 0.25 : 1 }}
      title={`${value}`}
    />
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--${color})` }} />
      {label}
    </span>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
        active
          ? "border-accent font-semibold text-accent"
          : "border-transparent font-medium text-text-secondary hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}
