import { Trash2 } from "lucide-react"
import { Select } from "@/components/ui/select"

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function LeadTable({
  columns,
  rows,
  isLoading,
  empty,
}: {
  columns: React.ReactNode[]
  rows?: React.ReactNode[][]
  isLoading: boolean
  empty: boolean
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-paper-soft text-left text-xs font-semibold uppercase tracking-wide text-ink/45">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="px-4 py-3 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/6">
          {isLoading && (
            <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-ink/40">Loading…</td></tr>
          )}
          {!isLoading && empty && (
            <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-ink/40">No records yet.</td></tr>
          )}
          {rows?.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-middle whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ContactCell({ phone, email, name }: { phone: string; email?: string | null; name?: string }) {
  return (
    <div>
      {name && <div className="font-semibold">{name}</div>}
      <div>{phone}</div>
      {email && <div className="text-xs text-ink/40">{email}</div>}
    </div>
  )
}

export function StatusSelect<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: T[] }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as T)} className="h-9 text-xs min-w-[140px]">
      {options.map((o) => (
        <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
      ))}
    </Select>
  )
}

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-2 rounded-lg hover:bg-red-50">
      <Trash2 className="h-4 w-4 text-red-500" />
    </button>
  )
}
