import { Badge } from "@/components/ui/badge"

type Tone = "success" | "danger" | "warning" | "blue" | "default"

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-600",
  default: "bg-ink/[0.06] text-ink",
}

const KNOWN: Record<string, Tone> = {
  active: "success",
  published: "success",
  suspended: "danger",
  hidden: "default",
  "walk-in": "warning",
  online: "blue",
}

export function StatusBadge({ tone, children }: { tone?: Tone; children: React.ReactNode }) {
  const resolved = tone ?? KNOWN[String(children).toLowerCase()] ?? "default"
  return <Badge className={TONE_CLASSES[resolved]}>{children}</Badge>
}
