import type { ReactNode } from "react";

interface BlockIconProps {
  icon: ReactNode | string | undefined;
  className?: string;
}

export function BlockIcon({ icon, className }: BlockIconProps) {
  if (typeof icon === "string") {
    return (
      <span className={className} dangerouslySetInnerHTML={{ __html: icon }} />
    );
  }
  return <span className={className}>{icon}</span>;
}
