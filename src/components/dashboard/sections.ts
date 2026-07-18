import { LayoutGrid, Package, LifeBuoy, Settings } from "lucide-react"

export type SectionKey = "overview" | "orders" | "support" | "settings"

export const SECTIONS: { key: SectionKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "orders", label: "Orders", icon: Package },
  { key: "support", label: "Repairs", icon: LifeBuoy },
  { key: "settings", label: "Settings", icon: Settings },
]
