import { Icon } from "./Icon";
import type { Task } from "../data/db";
import { dateLabel, urgencyColor, urgencyOf } from "../lib/dates";

interface Props {
  task: Task;
  onToggle: (done: boolean) => void;
}

export function TaskRow({ task, onToggle }: Props) {
  const urg = urgencyOf(task.date);
  const color = urgencyColor[urg];

  return (
    <div
      className={`flex items-center gap-3 rounded-[6px] px-3 py-2.5 hover:bg-hover ${
        task.done ? "opacity-75" : ""
      }`}
    >
      <button
        onClick={() => onToggle(!task.done)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${
          task.done ? "border-success bg-success" : "border-text-tertiary"
        }`}
      >
        {task.done && <Icon name="check" size={13} className="text-white" />}
      </button>

      <span
        className={`flex-1 text-sm ${
          task.done ? "text-text-tertiary line-through" : "text-text-primary"
        }`}
      >
        {task.text}
      </span>

      {task.date && (
        <span
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium"
          style={
            task.done
              ? { color: "var(--text-tertiary)", background: "var(--bg-hover)" }
              : {
                  color: `var(--${color})`,
                  background: `color-mix(in srgb, var(--${color}) 13%, transparent)`,
                }
          }
        >
          <Icon name="calendar" size={12} />
          {dateLabel(task.date)}
        </span>
      )}
    </div>
  );
}
