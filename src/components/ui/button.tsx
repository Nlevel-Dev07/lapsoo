import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#091739] text-white hover:bg-[#0f2354] shadow-[0_1px_0_rgba(255,255,255,0.1)_inset]",
        accent:
          "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_8px_20px_-6px_rgba(47,94,255,0.55)]",
        outline:
          "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
        ghost: "bg-transparent text-ink hover:bg-ink/[0.05]",
        whatsapp: "bg-[#25D366] text-white hover:bg-[#1fb958]",
        inverse: "bg-white text-ink hover:bg-white/90",
        outlineLight: "border border-white/30 text-white hover:bg-white/10",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
