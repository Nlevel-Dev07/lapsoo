import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MediaUploadField, emptyMediaSlots, type MediaSlots } from "@/components/shared/MediaUploadField"
import { submitSellExchange, ApiError } from "@/lib/api"

const schema = z.object({
  type: z.enum(["SELL", "EXCHANGE"], { message: "Select whether you want to sell or exchange" }),
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.literal("Gurgaon"),
  brand: z.string().min(1, "Laptop brand & model is required"),
  age: z.enum(["Less than 1 year", "1-2 years", "2-4 years", "4+ years"]),
  condition: z.enum(["Excellent", "Good", "Fair", "Needs Repair"]),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function SellExchangeForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [mediaSlots, setMediaSlots] = useState<MediaSlots>(emptyMediaSlots)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { city: "Gurgaon" } })

  const typeValue = watch("type")

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    if (!mediaSlots.front || !mediaSlots.back || !mediaSlots.open || !mediaSlots.video) {
      setMediaError("Please add all four required photos/video")
      return
    }
    setMediaError(null)
    try {
      await submitSellExchange({ ...data, mediaUrls: [mediaSlots.front, mediaSlots.back, mediaSlots.open, mediaSlots.video] })
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again or WhatsApp us.")
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
        <h3 className="mt-4 font-display text-xl font-bold">Got it — we'll be in touch shortly.</h3>
        <p className="mt-2 text-sm text-ink/55">Our team will call you with a valuation estimate within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="font-display text-xl font-bold">Get Your Laptop Valuation</h3>
      <p className="text-sm text-ink/55 -mt-3">Share your laptop details for a quick estimate — no obligation to sell.</p>

      <div>
        <Label>I want to *</Label>
        <div className="flex gap-4 mt-1.5">
          {(["SELL", "EXCHANGE"] as const).map((option) => (
            <label
              key={option}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${
                typeValue === option ? "border-blue-500 bg-blue-50 text-blue-700" : "border-ink/12 text-ink/60"
              }`}
            >
              <input type="radio" value={option} className="sr-only" {...register("type")} />
              {option === "SELL" ? "Sell" : "Exchange"}
            </label>
          ))}
        </div>
        {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Your name" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" placeholder="98765 43210" {...register("phone")} />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="you@email.com" {...register("email")} />
        </div>
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" readOnly value="Gurgaon" {...register("city")} />
        </div>
        <div>
          <Label htmlFor="brand">Laptop Brand & Model *</Label>
          <Input id="brand" placeholder="e.g. HP Pavilion 14" {...register("brand")} />
          {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
        </div>
        <div>
          <Label htmlFor="age">Approximate Age *</Label>
          <Select id="age" defaultValue="" {...register("age")}>
            <option value="" disabled>Select age</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-2 years">1-2 years</option>
            <option value="2-4 years">2-4 years</option>
            <option value="4+ years">4+ years</option>
          </Select>
          {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="condition">Condition *</Label>
          <Select id="condition" defaultValue="" {...register("condition")}>
            <option value="" disabled>Select condition</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repair">Needs Repair</option>
          </Select>
          {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Anything else we should know..." {...register("message")} />
      </div>

      <MediaUploadField source="sell-exchange" value={mediaSlots} onChange={setMediaSlots} error={mediaError ?? undefined} />

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Get Valuation"}
      </Button>
      <p className="text-xs text-center text-ink/40">By submitting, you agree to be contacted by Lapsoo via call, SMS or WhatsApp.</p>
    </form>
  )
}
