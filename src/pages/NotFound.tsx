import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSeo } from "@/lib/useSeo"

export default function NotFound() {
  useSeo({ title: "Page Not Found", description: "The page you're looking for doesn't exist." })
  return (
    <div className="container-lap py-32 text-center">
      <span className="font-display text-7xl font-extrabold text-ink/10">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink/50">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/">
        <Button variant="accent" size="lg" className="mt-8">Back to Home</Button>
      </Link>
    </div>
  )
}
