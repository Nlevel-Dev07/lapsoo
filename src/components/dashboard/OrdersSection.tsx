import { Package } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { OrderCard } from "./OrderCard"
import { EmptyState } from "./EmptyState"
import type { DashboardOrder } from "./types"

export function OrdersSection({ orders }: { orders: DashboardOrder[] }) {
  const navigate = useNavigate()

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Once you place an order, you'll be able to track it right here."
        actionLabel="Browse Laptops"
        onAction={() => navigate("/laptopbazaar")}
      />
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
