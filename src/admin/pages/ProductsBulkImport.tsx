import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import * as XLSX from "xlsx"
import { ChevronLeft, Download, UploadCloud, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/dashboard/Modal"
import { bulkImportProducts, ApiError, type BulkImportResponse } from "@/lib/api"

const TEMPLATE_HEADERS = [
  "Slug",
  "Brand",
  "Model",
  "Category",
  "Condition",
  "Ecosystem",
  "Price",
  "Processor",
  "RAM",
  "Storage",
  "Display",
  "Graphics",
  "Battery",
  "Warranty",
  "Screen Size",
  "Availability",
  "Highlights",
  "Images",
  "Published",
]

const TEMPLATE_EXAMPLE_ROW = [
  "dell-latitude-7420-refurb",
  "Dell",
  "Latitude 7420",
  "Business",
  "Certified Refurbished",
  "lapandtop",
  34999,
  "Intel Core i5-1145G7 (11th Gen)",
  "16GB DDR4",
  "512GB NVMe SSD",
  "14\" FHD IPS Anti-Glare",
  "Intel Iris Xe",
  "Up to 10 hours",
  "6 Months Lapsoo Warranty",
  14,
  "In Stock",
  "Backlit Keyboard|Fingerprint Reader",
  "",
  "TRUE",
]

const CATEGORIES = ["Business", "Student", "Gaming", "Workstation", "MacBook", "2-in-1"]
const CONDITIONS = ["New", "Certified Refurbished"]
const ECOSYSTEMS = ["lapandtop", "laptopbazaar"]
const AVAILABILITIES = ["In Stock", "Limited Stock", "On Order"]

const HEADER_FIELD_MAP: Record<string, string> = {
  slug: "slug",
  brand: "brandName",
  brandname: "brandName",
  model: "model",
  category: "category",
  condition: "condition",
  ecosystem: "ecosystem",
  price: "priceFrom",
  pricefrom: "priceFrom",
  processor: "processor",
  ram: "ram",
  storage: "storage",
  display: "display",
  graphics: "graphics",
  battery: "battery",
  warranty: "warranty",
  screensize: "screenSize",
  availability: "availability",
  highlights: "highlights",
  images: "images",
  published: "published",
}

interface ParsedRow {
  sourceRow: number
  payload: Record<string, unknown>
  preview: { slug: string; brand: string; model: string; priceFrom: unknown }
}

function normalizeKey(k: string) {
  return k.trim().toLowerCase().replace(/[\s_]+/g, "")
}

function normalizeEnumValue(value: string, options: string[]): string {
  const norm = value.trim().toLowerCase().replace(/\s+/g, "")
  return options.find((o) => o.toLowerCase().replace(/\s+/g, "") === norm) ?? value.trim()
}

function toStr(v: unknown): string {
  return v === undefined || v === null ? "" : String(v).trim()
}

function toNum(v: unknown): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) && toStr(v) !== "" ? n : undefined
}

function toBool(v: unknown, fallback: boolean): boolean {
  const s = toStr(v).toLowerCase()
  if (s === "") return fallback
  return ["true", "yes", "1", "y"].includes(s)
}

function toList(v: unknown): string[] {
  return toStr(v)
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
}

function toImageList(v: unknown): string[] {
  return toStr(v)
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  return rawRows.map((raw, i) => {
    const mapped: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(raw)) {
      const field = HEADER_FIELD_MAP[normalizeKey(key)]
      if (field) mapped[field] = value
    }

    const payload = {
      slug: toStr(mapped.slug),
      brandName: toStr(mapped.brandName),
      model: toStr(mapped.model),
      category: normalizeEnumValue(toStr(mapped.category), CATEGORIES),
      condition: normalizeEnumValue(toStr(mapped.condition), CONDITIONS),
      ecosystem: normalizeEnumValue(toStr(mapped.ecosystem), ECOSYSTEMS),
      priceFrom: toNum(mapped.priceFrom),
      processor: toStr(mapped.processor),
      ram: toStr(mapped.ram),
      storage: toStr(mapped.storage),
      display: toStr(mapped.display),
      graphics: toStr(mapped.graphics),
      battery: toStr(mapped.battery),
      warranty: toStr(mapped.warranty),
      screenSize: toNum(mapped.screenSize),
      availability: mapped.availability ? normalizeEnumValue(toStr(mapped.availability), AVAILABILITIES) : "In Stock",
      highlights: toList(mapped.highlights),
      images: toImageList(mapped.images),
      published: toBool(mapped.published, true),
    }

    return {
      sourceRow: i + 2,
      payload,
      preview: { slug: payload.slug, brand: payload.brandName, model: payload.model, priceFrom: mapped.priceFrom },
    }
  })
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Products")
  XLSX.writeFile(wb, "lapsoo-products-template.xlsx")
}

export default function ProductsBulkImport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<BulkImportResponse | null>(null)

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setResult(null)
    setParseError(null)
    setFileName(file.name)
    try {
      const buffer = await file.arrayBuffer()
      const parsed = parseWorkbook(buffer)
      if (parsed.length === 0) {
        setParseError("No rows found in the file.")
        setRows([])
        return
      }
      setRows(parsed)
    } catch {
      setParseError("Could not read this file. Make sure it's a valid .xlsx, .xls or .csv file.")
      setRows([])
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setResult(null)
    try {
      const res = await bulkImportProducts(rows.map((r) => r.payload))
      setResult(res)
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    } catch (err) {
      setParseError(err instanceof ApiError ? err.message : "Import failed.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <Link to="/admin/products" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Bulk Import Products</h1>
          <p className="mt-1 text-sm text-ink/50">Upload an Excel (.xlsx) or CSV file to create or update products in one go.</p>
        </div>
        <Button type="button" variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4" /> Download Template
        </Button>
      </div>

      <section className="mt-8 rounded-2xl border border-ink/8 bg-white p-6 space-y-4">
        <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">1. Upload File</h3>
        <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 p-8 text-sm text-ink/45 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
          <UploadCloud className="h-4 w-4" />
          {fileName ?? "Click to upload a .xlsx, .xls or .csv file"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>
        <p className="text-xs text-ink/40">
          Rows matching an existing product slug are updated; new slugs are created. Multi-value fields (Highlights,
          Images) are pipe-separated, e.g. <code className="rounded bg-paper-soft px-1 py-0.5">Backlit Keyboard|Fingerprint Reader</code>.
        </p>
        {parseError && <p className="text-sm text-red-500">{parseError}</p>}
      </section>

      {rows.length > 0 && (
        <section className="mt-6 rounded-2xl border border-ink/8 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8">
            <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">
              2. Preview ({rows.length} row{rows.length === 1 ? "" : "s"})
            </h3>
            <Button type="button" variant="accent" onClick={handleImport} disabled={importing}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {importing ? "Importing..." : `Import ${rows.length} Product${rows.length === 1 ? "" : "s"}`}
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-paper-soft text-left text-xs font-semibold uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Row</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {rows.map((r) => (
                <tr key={r.sourceRow}>
                  <td className="px-5 py-3 text-ink/40">{r.sourceRow}</td>
                  <td className="px-5 py-3 font-medium">{r.preview.slug || <span className="text-red-400">missing</span>}</td>
                  <td className="px-5 py-3 text-ink/70">{r.preview.brand}</td>
                  <td className="px-5 py-3 text-ink/70">{r.preview.model}</td>
                  <td className="px-5 py-3 text-ink/70">{String(r.preview.priceFrom)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Modal open={!!result} onClose={() => setResult(null)} title="Import Results" maxWidth="max-w-3xl">
        {result && (
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">{result.created} created</Badge>
              <Badge variant="blue">{result.updated} updated</Badge>
              {result.failed > 0 && <Badge variant="outline" className="border-red-200 text-red-500">{result.failed} failed</Badge>}
            </div>
            <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-xl border border-ink/8">
              <table className="w-full text-sm">
                <thead className="bg-paper-soft text-left text-xs font-semibold uppercase tracking-wide text-ink/45">
                  <tr>
                    <th className="px-5 py-3">Row</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {result.results.map((r) => (
                    <tr key={r.row}>
                      <td className="px-5 py-3 text-ink/40">{r.row}</td>
                      <td className="px-5 py-3 font-medium">{r.slug ?? "—"}</td>
                      <td className="px-5 py-3">
                        {r.status === "error" ? (
                          <span className="flex items-center gap-1.5 text-red-500 font-medium"><XCircle className="h-3.5 w-3.5" /> Error</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {r.status === "created" ? "Created" : "Updated"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink/50">{r.error ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="button" variant="accent" onClick={() => navigate("/admin/products")}>Go to Products</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
