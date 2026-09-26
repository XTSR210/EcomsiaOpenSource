import { cn } from "./lib/cn.js";

/**
 * Horizontal Ecomsia lockup (mark + wordmark + tagline).
 * Uses the official mark shipped in `assets/logo-white.png`.
 */
export function LogoLockup({
  tagline = "Agence Digitale",
  className,
}: {
  tagline?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/logo-white.png" alt="Ecomsia" width={36} height={36} className="size-9" />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-tight text-white">ECOMSIA</span>
        {tagline ? (
          <span className="mt-1 text-[10px] font-medium tracking-[0.35em] text-white/60">
            {tagline.toUpperCase()}
          </span>
        ) : null}
      </span>
    </span>
  );
}
