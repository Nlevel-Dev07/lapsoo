import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Laptop, Printer } from "lucide-react"
import { fetchJobsheet } from "@/lib/api"
import { SITE } from "@/data/site"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
      <div className="mt-0.5 text-sm text-ink/80">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/8 p-5 break-inside-avoid">
      <h4 className="font-display text-sm font-bold">{title}</h4>
      <div className="mt-3 grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export default function Jobsheet() {
  const { trackingCode } = useParams<{ trackingCode: string }>()
  const { data: r, isLoading, isError } = useQuery({
    queryKey: ["jobsheet", trackingCode],
    queryFn: () => fetchJobsheet(trackingCode!),
    enabled: !!trackingCode,
  })

  const storeInfo = r?.store ? SITE.addresses.find((a) => a.city === r.store) : undefined
  const mediaUrls = (r?.mediaUrls ?? []).filter(Boolean)

  return (
    <div className="min-h-screen bg-paper-soft/40 py-8 px-4 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        {isLoading && <p className="py-16 text-center text-ink/40">Loading jobsheet…</p>}
        {isError && <p className="py-16 text-center text-ink/40">No jobsheet found for this tracking ID.</p>}

        {r && (
          <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm sm:p-8 print:rounded-none print:border-0 print:shadow-none">
            <div className="flex items-start justify-between gap-4 border-b border-ink/8 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                  <Laptop className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold tracking-tight">{storeInfo?.city ?? SITE.name}</p>
                  <p className="text-xs text-ink/50 max-w-xs">{storeInfo?.line ?? SITE.primaryAddress}</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-2 text-xs font-semibold text-ink/60 hover:bg-ink/5 print:hidden"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl font-bold">Repair Jobsheet</h1>
                <p className="mt-0.5 text-xs text-ink/45">Tracking ID: {r.trackingCode}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {r.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="mt-5 space-y-5">
              <Section title="Customer">
                <Field label="Name">{r.name}</Field>
                <Field label="Phone">{r.phone}</Field>
                <Field label="Email">{r.email || "—"}</Field>
                <Field label="City">{r.city || "—"}</Field>
                <Field label="Location">{r.location || "—"}</Field>
              </Section>

              <Section title="Device">
                <Field label="Category">{r.deviceCategory === "Other" ? `Other — ${r.deviceCategoryOther || "—"}` : r.deviceCategory || "—"}</Field>
                <Field label="Brand">{r.brand === "Other" ? `Other — ${r.brandOther || "—"}` : r.brand || "—"}</Field>
                <Field label="Condition">{r.condition || "—"}</Field>
                <Field label="Device">{r.device}</Field>
                <Field label="Serial Number">{r.serialNumber || "—"}</Field>
                <Field label="Accessories">
                  {r.accessories.length
                    ? r.accessories.map((a) => (a === "Other" ? `Other — ${r.accessoriesOther || "—"}` : a)).join(", ")
                    : "—"}
                </Field>
                <Field label="Issue Type">{r.issueType === "Other" ? `Other — ${r.issueTypeOther || "—"}` : r.issueType}</Field>
              </Section>

              {r.message && (
                <Section title="Message">
                  <div className="sm:col-span-2 text-sm text-ink/70">{r.message}</div>
                </Section>
              )}

              <Section title="Repair Status">
                <Field label="Date Received">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Field>
                <Field label="Store">{r.store || "—"}</Field>
                <Field label="Estimate Cost">{r.estimateCost != null ? `₹${r.estimateCost}` : "TBD"}</Field>
                <Field label="Estimate Time">{r.estimateTime ?? "TBD"}</Field>
              </Section>

              {mediaUrls.length > 0 && (
                <div className="rounded-2xl border border-ink/8 p-5 print:hidden">
                  <h4 className="font-display text-sm font-bold">Media</h4>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {mediaUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-16 items-center justify-center rounded-xl bg-paper-soft text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        View {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-ink/35">
              {SITE.name} · {SITE.phone} · Track your repair anytime with tracking ID {r.trackingCode}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
