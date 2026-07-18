import { motion } from "framer-motion"
import { Pencil, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CustomerProfile } from "@/lib/api"

interface DashboardProfileHeaderProps {
  profile: CustomerProfile
  onEditProfile: () => void
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function memberSince(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
}

export function DashboardProfileHeader({ profile, onEditProfile }: DashboardProfileHeaderProps) {
  const filled = [profile.name, profile.email, profile.phone].filter(Boolean).length
  const completion = Math.round((filled / 3) * 100)
  const radius = 30
  const circumference = 2 * Math.PI * radius

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-ink/8 bg-gradient-to-br from-white to-blue-50/60 p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/[0.06]" />
      <div className="pointer-events-none absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-blue-500/[0.05]" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500 font-display text-xl font-bold text-white shadow-[0_8px_20px_-6px_rgba(47,94,255,0.5)]">
            {initials(profile.name)}
          </div>
          <div>
            <p className="text-sm text-ink/45">Hello,</p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">{profile.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-ink/40">
                <Calendar className="h-3.5 w-3.5" /> Member since {memberSince(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative h-[72px] w-[72px] shrink-0" role="img" aria-label={`Profile ${completion}% complete`}>
            <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
              <circle cx="36" cy="36" r={radius} fill="none" stroke="#e6e7eb" strokeWidth="6" />
              <motion.circle
                cx="36" cy="36" r={radius} fill="none" stroke="#2f5eff" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - completion / 100) }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-sm font-bold">{completion}%</span>
            </div>
            <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-ink/35">Profile</p>
          </div>

          <Button variant="outline" size="sm" onClick={onEditProfile} className="shrink-0">
            <Pencil className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
