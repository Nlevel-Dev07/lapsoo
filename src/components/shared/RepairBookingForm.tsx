import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2, Copy, LocateFixed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MediaUploadField, emptyMediaSlots, type MediaSlots } from "@/components/shared/MediaUploadField"
import { submitRepairBooking, ApiError } from "@/lib/api"

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.literal("Gurgaon"),
  device: z.string().min(1, "Device brand & model is required"),
  serialNumber: z.string().optional(),
  issueType: z.enum(["Screen", "Battery", "Keyboard", "SSD/RAM Upgrade", "Motherboard", "Data Recovery", "Other"]),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function RepairBookingForm() {
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [mediaSlots, setMediaSlots] = useState<MediaSlots>(emptyMediaSlots)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { city: "Gurgaon" } })

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    let valid = true
    if (!location.trim()) {
      setLocationError("Exact / current location is required")
      valid = false
    } else {
      setLocationError(null)
    }
    if (!mediaSlots.front || !mediaSlots.back || !mediaSlots.open || !mediaSlots.video) {
      setMediaError("Please add all four required photos/video")
      valid = false
    } else {
      setMediaError(null)
    }
    if (!valid) return
    try {
      const res = await submitRepairBooking({
        ...data,
        location,
        mediaUrls: [mediaSlots.front, mediaSlots.back, mediaSlots.open, mediaSlots.video],
      })
      setTrackingCode(res.trackingCode)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again or WhatsApp us.")
    }
  }

  if (trackingCode) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
        <h3 className="mt-4 font-display text-xl font-bold">Repair booked successfully.</h3>
        <p className="mt-2 text-sm text-ink/55">Save your tracking ID to check status anytime.</p>
        <button
          onClick={() => navigator.clipboard.writeText(trackingCode)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white border border-emerald-200 px-5 py-2.5 font-display font-bold text-lg text-emerald-700"
        >
          {trackingCode} <Copy className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="font-display text-xl font-bold">Book a Repair</h3>
      <p className="text-sm text-ink/55 -mt-3">Tell us the issue — our technician will call to confirm pricing before any pickup.</p>

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
          <Label htmlFor="serialNumber">Device Serial Number / Service Tag</Label>
          <Input id="serialNumber" placeholder="e.g. 5CD1234ABC" {...register("serialNumber")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="location">Exact / Current Location *</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Address, landmark, or use current location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={locating}>
              <LocateFixed className="h-4 w-4" /> {locating ? "Locating..." : "Use Current"}
            </Button>
          </div>
          {locationError && <p className="mt-1 text-xs text-red-500">{locationError}</p>}
        </div>
        <div>
          <Label htmlFor="device">Device Brand & Model *</Label>
          <Input id="device" placeholder="e.g. Dell Latitude 5420" {...register("device")} />
          {errors.device && <p className="mt-1 text-xs text-red-500">{errors.device.message}</p>}
        </div>
        <div>
          <Label htmlFor="issueType">Issue Type *</Label>
          <Select id="issueType" defaultValue="" {...register("issueType")}>
            <option value="" disabled>Select issue type</option>
            <option value="Screen">Screen</option>
            <option value="Battery">Battery</option>
            <option value="Keyboard">Keyboard</option>
            <option value="SSD/RAM Upgrade">SSD/RAM Upgrade</option>
            <option value="Motherboard">Motherboard</option>
            <option value="Data Recovery">Data Recovery</option>
            <option value="Other">Other</option>
          </Select>
          {errors.issueType && <p className="mt-1 text-xs text-red-500">{errors.issueType.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Describe the issue in more detail..." {...register("message")} />
      </div>

      <MediaUploadField source="repair" value={mediaSlots} onChange={setMediaSlots} error={mediaError ?? undefined} />

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Booking..." : "Book Repair"}
      </Button>
      <p className="text-xs text-center text-ink/40">By submitting, you agree to be contacted by Lapsoo via call, SMS or WhatsApp.</p>
    </form>
  )
}
