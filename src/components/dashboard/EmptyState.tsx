import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink/12 bg-paper-soft/60 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        <Icon className="h-7 w-7 text-blue-500" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink/50">{description}</p>
      {actionLabel && onAction && (
        <Button variant="accent" size="default" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
