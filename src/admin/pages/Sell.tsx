import { SellExchangeTable } from "@/admin/components/SellExchangeTable"
import { PageHeader } from "@/admin/components/PageHeader"

export default function Sell() {
  return (
    <div className="p-8 max-w-6xl">
      <PageHeader title="Sell" subtitle="Laptops customers want to sell to Lapsoo." />
      <div className="mt-6">
        <SellExchangeTable type="SELL" />
      </div>
    </div>
  )
}
