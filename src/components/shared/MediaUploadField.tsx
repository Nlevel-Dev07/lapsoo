import { useRef, useState } from "react"
import { ImagePlus, Loader2, Video, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { uploadLeadMedia } from "@/lib/api"

export interface MediaSlots {
  front: string
  back: string
  open: string
  video: string
}

export const emptyMediaSlots: MediaSlots = { front: "", back: "", open: "", video: "" }

interface SlotConfig {
  key: keyof MediaSlots
  label: string
  accept: string
  kind: "image" | "video"
}

const SLOTS: SlotConfig[] = [
  { key: "front", label: "Front", accept: "image/*", kind: "image" },
  { key: "back", label: "Back", accept: "image/*", kind: "image" },
  { key: "open", label: "Open Laptop", accept: "image/*", kind: "image" },
  { key: "video", label: "Video (explain the problem)", accept: "video/*", kind: "video" },
]

interface MediaUploadFieldProps {
  source: "repair" | "sell-exchange"
  value: MediaSlots
  onChange: (slots: MediaSlots) => void
  error?: string
}

export function MediaUploadField({ source, value, onChange, error }: MediaUploadFieldProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (slot: SlotConfig, file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    setUploading((u) => ({ ...u, [slot.key]: true }))
    try {
      const url = await uploadLeadMedia(file, source)
      onChange({ ...value, [slot.key]: url })
    } catch {
      setUploadError("One or more files failed to upload. Please try again.")
    } finally {
      setUploading((u) => ({ ...u, [slot.key]: false }))
    }
  }

  const clearSlot = (key: keyof MediaSlots) => onChange({ ...value, [key]: "" })

  return (
    <div>
      <Label>Photos / Video of the Laptop *</Label>
      <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SLOTS.map((slot) => {
          const url = value[slot.key]
          const isUploading = uploading[slot.key]
          return (
            <div key={slot.key}>
              <div className="relative h-24 rounded-xl overflow-hidden border border-dashed border-ink/20 bg-paper-soft">
                {url ? (
                  <>
                    {slot.kind === "video" ? (
                      <div className="flex h-full w-full items-center justify-center text-ink/40">
                        <Video className="h-6 w-6" />
                      </div>
                    ) : (
                      <img src={url} alt={slot.label} className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => clearSlot(slot.key)}
                      aria-label={`Remove ${slot.label}`}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : isUploading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-ink/40" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRefs.current[slot.key]?.click()}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink/40 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Add</span>
                  </button>
                )}
              </div>
              <p className="mt-1 text-center text-[11px] text-ink/50">{slot.label}</p>
              <input
                ref={(el) => { inputRefs.current[slot.key] = el }}
                type="file"
                accept={slot.accept}
                className="hidden"
                onChange={(e) => {
                  handleFile(slot, e.target.files?.[0])
                  e.target.value = ""
                }}
              />
            </div>
          )
        })}
      </div>

      <p className="mt-1.5 text-xs text-ink/40">
        Upload a front photo, back photo, a photo with the laptop open, and a short video explaining the problem.
      </p>
      {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
