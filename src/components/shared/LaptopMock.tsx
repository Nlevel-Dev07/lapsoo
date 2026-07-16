import { cn } from "@/lib/utils"

interface LaptopMockProps {
  className?: string
  from?: string
  to?: string
  glyph?: string
}

export function LaptopMock({ className, from = "#2f5eff", to = "#0b0c10", glyph = "L" }: LaptopMockProps) {
  return (
    <div className={cn("relative w-full aspect-[4/3] flex items-center justify-center", className)}>
      <div
        className="relative w-[78%] aspect-[16/10.4] rounded-[10px] shadow-2xl overflow-hidden ring-1 ring-black/10"
        style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
      >
        <div className="absolute inset-[6%] rounded-[4px] bg-black/20 flex items-center justify-center">
          <span className="font-display font-extrabold text-white/90 text-4xl tracking-tight">{glyph}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/25" />
      </div>
      <div className="absolute bottom-[13%] w-[86%] h-[7%] rounded-b-2xl bg-gradient-to-b from-[#d7d9de] to-[#aeb1ba]" />
    </div>
  )
}
