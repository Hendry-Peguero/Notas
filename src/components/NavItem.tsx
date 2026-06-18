import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  iconColor?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  indent?: boolean;
}

export function NavItem({
  icon,
  label,
  active,
  badge,
  iconColor,
  onClick,
  trailing,
  indent,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-[7px] text-left text-sm font-medium transition-colors ${
        active
          ? "bg-accent-soft text-accent"
          : "text-text-secondary hover:bg-hover hover:text-text-primary"
      } ${indent ? "pl-7" : ""}`}
    >
      <Icon
        name={icon}
        size={18}
        className="shrink-0"
        style={{ color: active ? "var(--accent)" : iconColor }}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-danger px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
          {badge}
        </span>
      )}
      {trailing}
    </button>
  );
}
