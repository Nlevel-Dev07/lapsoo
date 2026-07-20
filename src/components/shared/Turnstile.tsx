import { useEffect, useRef } from "react"

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js"

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    __turnstileOnLoad?: () => void
  }
}

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    window.__turnstileOnLoad = resolve
    const script = document.createElement("script")
    script.src = `${SCRIPT_SRC}?onload=__turnstileOnLoad&render=explicit`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
  return scriptPromise
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  className?: string
}

export function Turnstile({ onVerify, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  onVerifyRef.current = onVerify
  onExpireRef.current = onExpire

  useEffect(() => {
    let cancelled = false

    loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current?.(),
        "error-callback": () => onExpireRef.current?.(),
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [])

  return <div ref={containerRef} className={className} />
}
