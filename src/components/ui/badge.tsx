import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5",
  {
    variants: {
      variant: {
        default: "bg-ink/[0.06] text-ink",
        blue: "bg-blue-50 text-blue-600",
        dark: "bg-white/10 text-white",
        outline: "border border-ink/15 text-ink/70",
        success: "bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
