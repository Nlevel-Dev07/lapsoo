import { Link } from "react-router-dom"
import { MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SITE, telLink, waLink } from "@/data/site"

interface CTAGroupProps {
  quoteHref?: string
  message?: string
  className?: string
  variant?: "light" | "dark"
}

export function CTAGroup({ quoteHref = "/contact", message = "Hi Lapsoo, I'd like to get a quote.", className, variant = "light" }: CTAGroupProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3">
        <Link to={quoteHref}>
          <Button variant={variant === "dark" ? "inverse" : "accent"} size="lg">
            Get Quote
          </Button>
        </Link>
        <a href={waLink(message)} target="_blank" rel="noopener noreferrer">
          <Button variant="whatsapp" size="lg">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        </a>
        <a href={telLink()}>
          <Button variant={variant === "dark" ? "outlineLight" : "outline"} size="lg">
            <Phone className="h-4 w-4" /> Call {SITE.phone}
          </Button>
        </a>
      </div>
    </div>
  )
}
