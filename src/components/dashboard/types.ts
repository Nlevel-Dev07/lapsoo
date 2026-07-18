export type OrderStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled"

export interface TrackingStep {
  label: string
  date: string
  done: boolean
}

export interface DashboardOrder {
  id: string
  orderNumber: string
  productSlug: string
  brand: string
  model: string
  price: number
  orderedAt: string
  status: OrderStatus
  eta?: string
  gradientFrom: string
  gradientTo: string
  trackingSteps: TrackingStep[]
}

