import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** icon-mark size in px */
  size?: number;
  withWordmark?: boolean;
}

/**
 * MEAT GUARD identity mark — a shield (safety) wrapping a sensor target
 * (detection), in the brand meat-red → safety-green gradient.
 */
export function Logo({ className, size = 36, withWordmark = true }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0 drop-shadow-[0_0_10px_hsl(var(--meat)/0.5)]"
      >
        <defs>
          <linearGradient id="mg-logo" x1="0" y1="0" x2="64" y2="64">
            <stop stopColor="hsl(var(--meat))" />
            <stop offset="1" stopColor="hsl(var(--safe))" />
          </linearGradient>
        </defs>
        <path
          d="M32 4 L54 13 V30 C54 45 44 56 32 60 C20 56 10 45 10 30 V13 Z"
          fill="hsl(240 18% 6%)"
          stroke="url(#mg-logo)"
          strokeWidth="3"
        />
        <circle cx="32" cy="30" r="11" fill="none" stroke="url(#mg-logo)" strokeWidth="3" />
        <circle cx="32" cy="30" r="4" fill="hsl(var(--meat))" />
        <path
          d="M32 14 V8 M32 52 V46 M16 30 H10 M54 30 H48"
          stroke="hsl(var(--safe))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight">
            MEAT<span className="text-meat">GUARD</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Food Safety
          </span>
        </span>
      )}
    </span>
  );
}
