import { SellExchangeTable } from "@/admin/components/SellExchangeTable"
import { PageHeader } from "@/admin/components/PageHeader"

export default function Exchange() {
  return (
    <div className="p-8 max-w-6xl">
      <PageHeader title="Exchange" subtitle="Laptops customers want to exchange towards a new or refurbished device." />
      <div className="mt-6">
        <SellExchangeTable type="EXCHANGE" />
      </div>
    </div>
  )
}
