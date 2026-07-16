import { useEffect } from "react"

interface SeoOptions {
  title: string
  description: string
  image?: string
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

export function useSeo({ title, description, image }: SeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} | Lapsoo`
    document.title = fullTitle
    setMeta("name", "description", description)
    setMeta("property", "og:title", fullTitle)
    setMeta("property", "og:description", description)
    setMeta("property", "og:type", "website")
    setMeta("name", "twitter:card", "summary_large_image")
    setMeta("name", "twitter:title", fullTitle)
    setMeta("name", "twitter:description", description)
    if (image) {
      setMeta("property", "og:image", image)
      setMeta("name", "twitter:image", image)
    }
  }, [title, description, image])
}
