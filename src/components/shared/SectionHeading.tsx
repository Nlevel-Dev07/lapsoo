import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
  dark?: boolean
}

export function SectionHeading({ eyebrow, title, description, align = "left", className, dark }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      {eyebrow && (
        <Badge variant={dark ? "dark" : "blue"} className="mb-4">
          {eyebrow}
        </Badge>
      )}
      <h2
        className={cn(
          "font-display text-[32px] md:text-[42px] font-extrabold tracking-tight leading-[1.08] text-balance",
          dark ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-[16px] md:text-[17px] leading-relaxed", dark ? "text-white/60" : "text-ink/55")}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
