import { SellExchangeTable } from "@/admin/components/SellExchangeTable"

export default function Sell() {
  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Sell</h1>
      <p className="mt-1 text-sm text-ink/50">Laptops customers want to sell to Lapsoo.</p>
      <div className="mt-6">
        <SellExchangeTable type="SELL" />
      </div>
    </div>
  )
}
