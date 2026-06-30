import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.algalle.com"

// Public, indexable routes. Dynamic listing pages (hotels/[id], etc.) are
// discovered via internal links; add them here from the API later if needed.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/hotels", priority: 0.9, changeFrequency: "daily" },
  { path: "/restaurants", priority: 0.9, changeFrequency: "daily" },
  { path: "/transport", priority: 0.9, changeFrequency: "daily" },
  { path: "/experiences", priority: 0.9, changeFrequency: "daily" },
  { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/attractions", priority: 0.8, changeFrequency: "weekly" },
  { path: "/cities", priority: 0.8, changeFrequency: "weekly" },
  { path: "/planner", priority: 0.7, changeFrequency: "monthly" },
  { path: "/assistant", priority: 0.7, changeFrequency: "monthly" },
  { path: "/concierge", priority: 0.6, changeFrequency: "monthly" },
  { path: "/host", priority: 0.6, changeFrequency: "monthly" },
  { path: "/business", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/help", priority: 0.5, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
