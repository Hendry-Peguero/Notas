import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

const toPascal = (name: string) =>
  name
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const Cmp = (Lucide as unknown as Record<string, React.ComponentType<LucideProps>>)[
    toPascal(name)
  ];
  if (!Cmp) return <Lucide.Square {...props} />;
  return <Cmp {...props} />;
}
