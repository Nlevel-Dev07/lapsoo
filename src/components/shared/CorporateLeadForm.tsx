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
import { submitCorporateLead, ApiError } from "@/lib/api"

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  quantity: z.enum(["1-10", "11-50", "51-200", "200+"]),
  gstin: z.string().optional(),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CorporateLeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      await submitCorporateLead(data)
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again or WhatsApp us.")
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
        <h3 className="mt-4 font-display text-xl font-bold">Thank you — your corporate enquiry is in.</h3>
        <p className="mt-2 text-sm text-ink/55">A dedicated account manager will respond within one business day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <Input id="email" placeholder="you@company.com" {...register("email")} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Delhi, Bengaluru..." {...register("city")} />
        </div>
        <div>
          <Label htmlFor="company">Company Name *</Label>
          <Input id="company" placeholder="Your organization" {...register("company")} />
          {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
        </div>
        <div>
          <Label htmlFor="quantity">Number of Laptops *</Label>
          <Select id="quantity" defaultValue="" {...register("quantity")}>
            <option value="" disabled>Select a range</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="200+">200+</option>
          </Select>
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="gstin">GSTIN (if available)</Label>
          <Input id="gstin" placeholder="22AAAAA0000A1Z5" {...register("gstin")} />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Tell us about your requirement, timeline, and preferred brands..." {...register("message")} />
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Corporate Enquiry"}
      </Button>
      <p className="text-xs text-center text-ink/40">By submitting, you agree to be contacted by Lapsoo via call, SMS or WhatsApp.</p>
    </form>
  )
}
