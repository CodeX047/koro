import { cn } from "~/lib/utils";

/** Background, border, and text colors for inline status badges matching Kōro design system. */
export const statusBadgeClass = {
  success: "border-[var(--koro-success)]/40 bg-[var(--koro-success)]/15 text-[var(--koro-success)]",
  warning: "border-[var(--koro-warning)]/40 bg-[var(--koro-warning)]/15 text-[var(--koro-warning)]",
  danger: "border-[var(--koro-danger)]/40 bg-[var(--koro-danger)]/15 text-[var(--koro-danger)]",
  info: "border-[var(--koro-accent)]/40 bg-[var(--koro-accent)]/15 text-[var(--koro-accent)]",
  neutral:
    "border-[var(--koro-hairline-strong)]/40 bg-[var(--koro-surface-dark-elevated)] text-[var(--koro-ash)]",
} as const;

/** Button variants for primary actions like "Install" or "Disconnect". */
export const statusButtonClass = {
  success:
    "bg-[var(--koro-success)] text-black hover:bg-[var(--koro-success)]/90 font-bold focus-visible:ring-[var(--koro-success)]/50 gap-1.5",
  danger:
    "border-[var(--koro-danger)]/50 bg-[var(--koro-danger)]/10 text-[var(--koro-danger)] hover:bg-[var(--koro-danger)]/20 font-semibold gap-1.5",
  warning:
    "border-[var(--koro-warning)]/50 bg-[var(--koro-warning)]/10 text-[var(--koro-warning)] hover:bg-[var(--koro-warning)]/20 gap-1.5",
} as const;

/**
 * Builds a complete className string for a small status badge pill.
 *
 * @param tone - Semantic color from `statusBadgeClass` keys.
 * @param className - Optional extra classes (e.g. `gap-1` when an icon is inside).
 * @returns A merged Tailwind class string ready for a `<span>`.
 */
export function statusBadge(tone: keyof typeof statusBadgeClass, className?: string) {
  return cn(
    "inline-flex items-center rounded-none border px-2 py-0.5 text-xs font-medium capitalize",
    statusBadgeClass[tone],
    className,
  );
}
export default statusBadge;
