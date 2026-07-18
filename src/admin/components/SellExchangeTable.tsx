import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSellExchangeLeads, updateSellExchangeStatus, deleteSellExchangeLead, type LeadStatus } from "@/lib/api"
import { LeadTable, ContactCell, StatusSelect, DeleteButton, fmtDate } from "@/admin/components/LeadTable"

const leadStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]

export function SellExchangeTable({ type }: { type: "SELL" | "EXCHANGE" }) {
  const queryClient = useQueryClient()
  const queryKey = ["admin-sell-exchange", type]
  const { data, isLoading } = useQuery({ queryKey, queryFn: () => fetchSellExchangeLeads({ type }) })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateSellExchangeStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
  const remove = useMutation({
    mutationFn: deleteSellExchangeLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return (
    <LeadTable
      isLoading={isLoading}
      empty={!data?.length}
      columns={["Contact", "Laptop", "Age", "Condition", "Date", "Status", ""]}
      rows={data?.map((s) => [
        <ContactCell phone={s.phone} email={s.email} name={s.name} />,
        s.brand,
        s.age,
        s.condition,
        fmtDate(s.createdAt),
        <StatusSelect value={s.status} onChange={(status) => updateStatus.mutate({ id: s.id, status })} options={leadStatuses} />,
        <DeleteButton onClick={() => confirm("Delete this lead?") && remove.mutate(s.id)} />,
      ])}
    />
  )
}
