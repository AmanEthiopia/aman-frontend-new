import { Bed, Car, Compass, Utensils, type LucideIcon } from "lucide-react"
import type { FeatureFlag } from "@/lib/config/features"

/**
 * Home hero content. Static on purpose: the hero must not add any API
 * traffic, so slides ship with the bundle (photos in /public/hero/fallback).
 * The shape matches the design handoff's HeroSlide so a backend-driven deck
 * can replace HERO_SLIDES later without touching the component.
 */
export type HeroSlide = {
  id: string
  kind: "city" | "attraction" | "event"
  slug: string
  name: string
  nameAm?: string
  region?: string
  /** Used in "Stays in {linkLabel} →". */
  linkLabel: string
  tagline?: string
  /** Where "Stays in …" goes — existing listing route + its `search` param. */
  href: string
  image: { wide: string; tall?: string; focalWide?: string; focalTall?: string; alt: string }
}

const IMG = "/hero/fallback"

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "fallback-lalibela",
    kind: "city",
    slug: "lalibela",
    name: "Lalibela",
    nameAm: "ላሊበላ",
    region: "Amhara",
    linkLabel: "Lalibela",
    tagline: "Eleven churches carved down into living rock — still in daily use.",
    href: "/hotels?search=Lalibela",
    image: {
      wide: `${IMG}/lalibela-wide.jpg`,
      tall: `${IMG}/lalibela-tall.jpg`,
      focalWide: "center 55%",
      focalTall: "center",
      alt: "Rock-hewn church of Bete Giyorgis, Lalibela",
    },
  },
  {
    id: "fallback-simien",
    kind: "attraction",
    slug: "simien-mountains",
    name: "Simien Mountains",
    nameAm: "ሰሜን ተራሮች",
    region: "Amhara",
    linkLabel: "the Simiens",
    tagline: "Sheer escarpments, gelada troops and some of Africa's highest trails.",
    href: "/hotels?search=Simien",
    image: {
      wide: `${IMG}/simien-wide.jpg`,
      tall: `${IMG}/simien.jpg`,
      focalWide: "center 40%",
      focalTall: "45% center",
      alt: "Simien Mountains escarpment",
    },
  },
  {
    id: "fallback-danakil",
    kind: "attraction",
    slug: "danakil-depression",
    name: "Danakil Depression",
    nameAm: "ዳናኪል",
    region: "Afar",
    linkLabel: "Afar",
    tagline: "Salt flats and sulphur pools far below sea level.",
    href: "/hotels?search=Afar",
    image: {
      wide: `${IMG}/danakil-wide.jpg`,
      tall: `${IMG}/danakil-tall.jpg`,
      focalWide: "center",
      focalTall: "center",
      alt: "Sulphur pools of Dallol, Danakil Depression",
    },
  },
  {
    id: "fallback-timkat",
    kind: "event",
    slug: "timkat",
    name: "Timkat",
    nameAm: "ጥምቀት",
    region: "Festivals",
    linkLabel: "Gondar",
    tagline: "Processions, ceremonial umbrellas and white netela — worth planning a trip around.",
    href: "/hotels?search=Gondar",
    image: {
      wide: `${IMG}/timkat-wide.jpg`,
      tall: `${IMG}/timkat-tall.jpg`,
      focalWide: "center 40%",
      focalTall: "center 30%",
      alt: "Timkat procession with ceremonial umbrellas",
    },
  },
]

export type HeroSearchTab = {
  key: string
  label: string
  icon: LucideIcon
  /** Existing listing route the search submits to (reads `?search=`). */
  route: string
  flag?: FeatureFlag
  where: string
  whereHint: string
  when: string
  whenHint: string
  /** Transport picks a flight time, everything else a day. */
  whenType: "date" | "datetime-local"
  who: string
  whoUnit: string
  cta: string
}

export const HERO_SEARCH_TABS: HeroSearchTab[] = [
  {
    key: "hotels",
    label: "Hotels",
    icon: Bed,
    route: "/hotels",
    where: "Where",
    whereHint: "Lalibela, Gondar, Addis…",
    when: "When",
    whenHint: "Add dates",
    whenType: "date",
    who: "Guests",
    whoUnit: "adults",
    cta: "Search stays",
  },
  {
    key: "restaurants",
    label: "Restaurants",
    icon: Utensils,
    route: "/restaurants",
    flag: "RESTAURANTS",
    where: "Where",
    whereHint: "Bole, Piassa, Kazanchis…",
    when: "When",
    whenHint: "Tonight",
    whenType: "date",
    who: "Party",
    whoUnit: "people",
    cta: "Find a table",
  },
  {
    key: "transport",
    label: "Transport",
    icon: Car,
    route: "/transport",
    flag: "TRANSPORT",
    where: "Pickup",
    whereHint: "Bole International Airport",
    when: "Arrival",
    whenHint: "Add flight time",
    whenType: "datetime-local",
    who: "Riders",
    whoUnit: "people",
    cta: "Book a ride",
  },
  {
    key: "experiences",
    label: "Experiences",
    icon: Compass,
    route: "/experiences",
    flag: "EXPERIENCES",
    where: "Where",
    whereHint: "Simien, Lalibela, Danakil…",
    when: "When",
    whenHint: "Any dates",
    whenType: "date",
    who: "Group",
    whoUnit: "people",
    cta: "Find experiences",
  },
]
