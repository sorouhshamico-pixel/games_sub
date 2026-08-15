import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
      <p className="text-lg font-medium text-[var(--color-text-primary)]">{title}</p>
      {description ? <p className="text-sm text-[var(--color-text-muted)]">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/40 bg-danger/5 p-10 text-center"
    >
      <p className="text-lg font-medium text-danger">{title}</p>
      {description ? <p className="text-sm text-[var(--color-text-muted)]">{description}</p> : null}
      {action}
    </div>
  );
}

export function OfflineBanner({ message }: { message: string }) {
  return (
    <div role="status" className="w-full bg-[var(--color-surface-elevated)] px-4 py-2 text-center text-sm">
      {message}
    </div>
  );
}
