import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSellExchangeLeads, updateSellExchangeStatus, deleteSellExchangeLead, type LeadStatus } from "@/lib/api"
import { LeadTable, ContactCell, StatusSelect, DeleteButton, fmtDate } from "@/admin/components/LeadTable"
import { useConfirm } from "@/admin/components/ConfirmDialog"
import { useToast } from "@/admin/components/Toast"

const leadStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]

export function SellExchangeTable({ type }: { type: "SELL" | "EXCHANGE" }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const queryKey = ["admin-sell-exchange", type]
  const { data, isLoading } = useQuery({ queryKey, queryFn: () => fetchSellExchangeLeads({ type }) })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateSellExchangeStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast.error("Could not update status."),
  })
  const remove = useMutation({
    mutationFn: deleteSellExchangeLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success("Lead deleted.")
    },
    onError: () => toast.error("Could not delete lead."),
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
        <DeleteButton
          onClick={async () => {
            const ok = await confirm({ title: "Delete this lead?", confirmLabel: "Delete", danger: true })
            if (ok) remove.mutate(s.id)
          }}
        />,
      ])}
    />
  )
}
