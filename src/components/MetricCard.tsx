import { Icon } from "./Icon";

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color: string; // token name, e.g. "danger"
}

export function MetricCard({ icon, label, value, color }: Props) {
  return (
    <div className="flex-1 rounded-[10px] border border-border bg-card p-[18px]">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={16} style={{ color: `var(--${color})` }} />
        <span className="text-[13px] font-medium text-text-secondary">{label}</span>
      </div>
      <div className="mt-2 text-[30px] font-bold" style={{ color: `var(--${color})` }}>
        {value}
      </div>
    </div>
  );
}
