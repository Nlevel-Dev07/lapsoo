import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check, FileText, RotateCcw, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LaptopMock } from "@/components/shared/LaptopMock"
import { formatPrice } from "@/data/products"
import { Modal } from "./Modal"
import { formatDate } from "./format"
import type { DashboardOrder, OrderStatus } from "./types"

const STATUS_VARIANT: Record<OrderStatus, "success" | "blue" | "default" | "outline"> = {
  Delivered: "success",
  "Out for Delivery": "blue",
  Shipped: "blue",
  Processing: "default",
  Cancelled: "outline",
}

export function OrderCard({ order }: { order: DashboardOrder }) {
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div className="w-full shrink-0 rounded-xl bg-paper-soft sm:w-32">
          <LaptopMock glyph={order.brand[0]} from={order.gradientFrom} to={order.gradientTo} className="p-3" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
            <span className="text-xs text-ink/35">#{order.orderNumber}</span>
          </div>
          <h3 className="mt-2 font-display text-base font-bold leading-snug">{order.brand} {order.model}</h3>
          <p className="mt-1 text-sm text-ink/45">
            Ordered {formatDate(order.orderedAt)} · {formatPrice(order.price)}
            {order.eta && order.status !== "Delivered" && <> · ETA {formatDate(order.eta)}</>}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setTrackingOpen((v) => !v)}>
              Track Order <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${trackingOpen ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(true)}>
              <FileText className="h-3.5 w-3.5" /> Download Invoice
            </Button>
            <Link to={`/products/${order.productSlug}`}>
              <Button variant="ghost" size="sm">
                <RotateCcw className="h-3.5 w-3.5" /> Buy Again
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {trackingOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-ink/8 bg-paper-soft/60"
          >
            <ol className="flex flex-col gap-4 p-5 sm:flex-row sm:gap-2">
              {order.trackingSteps.map((step, i) => (
                <li key={step.label} className="flex flex-1 items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
                  <div className="flex items-center gap-2 sm:flex-col">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        step.done ? "bg-blue-500 text-white" : "bg-ink/8 text-ink/35"
                      }`}
                    >
                      {step.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    {i < order.trackingSteps.length - 1 && (
                      <span className={`hidden h-0.5 flex-1 sm:mt-0 ${step.done ? "bg-blue-500" : "bg-ink/10"} sm:block sm:w-16`} />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${step.done ? "text-ink" : "text-ink/40"}`}>{step.label}</p>
                    {step.date && <p className="text-[11px] text-ink/35">{formatDate(step.date)}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title={`Invoice · ${order.orderNumber}`}>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-paper-soft p-4">
            <div>
              <p className="font-semibold">{order.brand} {order.model}</p>
              <p className="text-xs text-ink/45">Ordered {formatDate(order.orderedAt)}</p>
            </div>
            <p className="font-display text-lg font-bold">{formatPrice(order.price)}</p>
          </div>
          <div className="space-y-2 text-ink/60">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(Math.round(order.price / 1.18))}</span></div>
            <div className="flex justify-between"><span>GST (18%)</span><span>{formatPrice(order.price - Math.round(order.price / 1.18))}</span></div>
            <div className="flex justify-between border-t border-ink/8 pt-2 font-semibold text-ink"><span>Total</span><span>{formatPrice(order.price)}</span></div>
          </div>
          <Button variant="accent" size="default" className="w-full" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
