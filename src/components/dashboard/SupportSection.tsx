import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { LifeBuoy, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./EmptyState"
import { formatDate } from "./format"
import type { MyRepairRequest } from "@/lib/api"

type BadgeVariant = "success" | "blue" | "default" | "outline"

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  BOOKED: "default",
  DIAGNOSING: "blue",
  IN_PROGRESS: "blue",
  WAITING_FOR_PARTS: "blue",
  COMPLETED: "success",
  DELIVERED: "success",
  CANCELLED: "outline",
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

function RequestCard({ request }: { request: MyRepairRequest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-ink/8 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold">{request.device}</h3>
        <Badge variant={STATUS_VARIANT[request.status] ?? "default"}>{statusLabel(request.status)}</Badge>
      </div>
      <p className="mt-1 text-xs text-ink/40">
        Tracking ID <span className="font-mono font-semibold text-ink/60">{request.trackingCode}</span> · {request.issueType} · Booked {formatDate(request.createdAt)}
      </p>
      {request.message && <p className="mt-3 text-sm text-ink/55">{request.message}</p>}
    </motion.div>
  )
}

export function SupportSection({ requests }: { requests: MyRepairRequest[] }) {
  const navigate = useNavigate()
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/45">Repair requests you've booked with LapTech.</p>
        <Link to="/laptech">
          <Button variant="accent" size="sm">
            Book a Repair <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {requests.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No repair requests yet"
            description="Book a repair with LapTech and it'll show up here with live status updates."
            actionLabel="Book a Repair"
            onAction={() => navigate("/laptech")}
          />
        ) : (
          requests.map((r) => <RequestCard key={r.id} request={r} />)
        )}
      </div>
    </>
  )
}
