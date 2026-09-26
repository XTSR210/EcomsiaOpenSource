import { cn } from "./lib/cn.js";

/**
 * Ecomsia hexagonal brand badge.
 * Pure SVG, no runtime dependency — drop it anywhere.
 *
 * Token overrides via CSS variables:
 *   --ecomsia-accent (default #0ff1cf)
 *   --ecomsia-ice    (default #e9fdff)
 */
export function HexBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Ecomsia"
      className={cn("size-9", className)}
    >
      <rect width="100" height="100" rx="22" fill="#0b1220" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#0ff1cf" strokeOpacity="0.18" strokeWidth="1.5" />
      <path
        d="M50 12 L83 31 L83 69 L50 88 L17 69 L17 31 Z"
        fill="none"
        stroke="var(--ecomsia-accent, #0ff1cf)"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <g fill="var(--ecomsia-ice, #e9fdff)">
        <rect x="41" y="35" width="7" height="30" rx="1.6" />
        <rect x="41" y="35" width="18" height="6.5" rx="1.6" />
        <rect x="41" y="46.75" width="15" height="6.5" rx="1.6" />
        <rect x="41" y="58.5" width="18" height="6.5" rx="1.6" />
      </g>
    </svg>
  );
}
