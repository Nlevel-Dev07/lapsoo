import type { ReactElement } from "react"

export type SocialIconKey = "instagram" | "facebook" | "linkedin" | "twitter"

const paths: Record<SocialIconKey, ReactElement> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </>
  ),
  facebook: (
    <path
      d="M14.5 8.5h2V5.6c-.35-.05-1.55-.15-2.95-.15-2.92 0-4.92 1.78-4.92 5.05v2.6H6.3v3.25h3.33V21h3.36v-4.65h3.2l.5-3.25h-3.7v-2.26c0-.94.26-1.59 1.51-1.59Z"
      fill="currentColor"
    />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <circle cx="7.2" cy="8" r="1.15" fill="currentColor" />
      <path
        d="M6.3 10.8h1.8V17H6.3v-6.2Zm3.6 0h1.75v.9c.5-.72 1.2-1.06 2.1-1.06 1.75 0 2.55 1.15 2.55 3.05V17h-1.8v-3.02c0-.9-.35-1.5-1.2-1.5-.85 0-1.4.6-1.4 1.6V17H9.9v-6.2Z"
        fill="currentColor"
      />
    </>
  ),
  twitter: (
    <path
      d="M13.9 10.4 20.3 3h-1.5l-5.6 6.4L8.7 3H3.5l6.7 9.6L3.5 21h1.5l5.9-6.8L15.9 21h5.2l-7.2-10.6Zm-2.1 2.4-.7-1L5.7 4.1h2.3l4.4 6.3.7 1 5.8 8.3h-2.3l-4.8-6.7Z"
      fill="currentColor"
    />
  ),
}

export function SocialIcon({ icon, className }: { icon: SocialIconKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {paths[icon]}
    </svg>
  )
}

interface SocialLink {
  id: SocialIconKey
  label: string
  href: string
}

export function SocialIconRow({ links, className }: { links: SocialLink[]; className?: string }) {
  return (
    <ul className={className ?? "flex gap-3"}>
      {links.map((social) => (
        <li key={social.id}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-400"
          >
            <SocialIcon icon={social.id} className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  )
}
