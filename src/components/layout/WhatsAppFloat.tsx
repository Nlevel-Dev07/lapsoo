import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { waLink } from "@/data/site"

export function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink("Hi Lapsoo, I have a question about your laptops.")}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)]"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" fill="white" strokeWidth={0} />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </motion.a>
  )
}
