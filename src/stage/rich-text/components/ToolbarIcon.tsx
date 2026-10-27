export type ToolbarIconName =
  | "align-left"
  | "align-center"
  | "align-right"
  | "align-justify"
  | "space-before"
  | "line-height"
  | "list-bullet"
  | "list-ordered"
  | "emoji"
  | "link"
  | "unlink"
  | "chevron";

interface ToolbarIconProps {
  name: ToolbarIconName;
}

export function ToolbarIcon({ name }: ToolbarIconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
      {iconPaths(name)}
    </svg>
  );
}

function iconPaths(name: ToolbarIconName) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "space-before":
      return (
        <g {...stroke}>
          <path d="M4 4h16M4 15h16M4 20h10" />
          <path d="M12 7v5m-3-3 3 3 3-3" />
        </g>
      );
    case "line-height":
      return (
        <g {...stroke}>
          <path d="M11 5h9M11 12h9M11 19h9" />
          <path d="M5 4v16M2 7l3-3 3 3M2 17l3 3 3-3" />
        </g>
      );
    case "align-left":
      return (
        <g {...stroke}>
          <path d="M4 6h16" />
          <path d="M4 10h10" />
          <path d="M4 14h16" />
          <path d="M4 18h10" />
        </g>
      );
    case "align-center":
      return (
        <g {...stroke}>
          <path d="M4 6h16" />
          <path d="M7 10h10" />
          <path d="M4 14h16" />
          <path d="M7 18h10" />
        </g>
      );
    case "align-right":
      return (
        <g {...stroke}>
          <path d="M4 6h16" />
          <path d="M10 10h10" />
          <path d="M4 14h16" />
          <path d="M10 18h10" />
        </g>
      );
    case "align-justify":
      return (
        <g {...stroke}>
          <path d="M4 6h16" />
          <path d="M4 10h16" />
          <path d="M4 14h16" />
          <path d="M4 18h16" />
        </g>
      );
    case "list-bullet":
      return (
        <g {...stroke}>
          <path d="M10 7h10" />
          <path d="M10 12h10" />
          <path d="M10 17h10" />
          <circle cx="5" cy="7" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="5" cy="17" r="1.2" fill="currentColor" stroke="none" />
        </g>
      );
    case "list-ordered":
      return (
        <g {...stroke}>
          <path d="M11 7h9" />
          <path d="M11 12h9" />
          <path d="M11 17h9" />
          <text x="3" y="9" fill="currentColor" stroke="none" fontSize="7" fontFamily="sans-serif">
            1
          </text>
          <text x="3" y="14" fill="currentColor" stroke="none" fontSize="7" fontFamily="sans-serif">
            2
          </text>
          <text x="3" y="19" fill="currentColor" stroke="none" fontSize="7" fontFamily="sans-serif">
            3
          </text>
        </g>
      );
    case "emoji":
      return (
        <g {...stroke}>
          <circle cx="12" cy="12" r="8" />
          <path d="M8.5 14.2a4.2 4.2 0 0 0 7 0" />
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
        </g>
      );
    case "link":
      return (
        <g {...stroke}>
          <path d="M10 13a5 5 0 0 0 7.1.1l1.8-1.8a5 5 0 0 0-7.1-7.1L10.2 5.8" />
          <path d="M14 11a5 5 0 0 0-7.1-.1L5.1 12.7a5 5 0 0 0 7.1 7.1l1.6-1.6" />
        </g>
      );
    case "unlink":
      return (
        <g {...stroke}>
          <path d="M9 17H7a5 5 0 0 1 0-10h2" />
          <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
          <path d="M8 12h4" />
          <path d="m4 4 16 16" />
        </g>
      );
    case "chevron":
      return (
        <path
          d="M7 10.2 12 15l5-4.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
}
