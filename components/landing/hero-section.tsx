"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react"
import Link from "next/link"
import Image, { getImageProps } from "next/image"
import { useRouter } from "next/navigation"
import { Poppins, Noto_Sans_Ethiopic } from "next/font/google"
import { ArrowRight, Calendar, Check, MapPin, Search, ShieldCheck, Sparkles, Star, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { FEATURES } from "@/lib/config/features"
import { useApp } from "@/lib/contexts/app-context"
import { HERO_SEARCH_TABS, HERO_SLIDES, type HeroSearchTab, type HeroSlide } from "@/components/landing/hero-slides"

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-hero", display: "swap" })
const notoEthiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], variable: "--font-hero-am", display: "swap" })

const SLIDE_MS = 7000
const SEAM_MS = 1700
const SWIPE_PX = 40
const DEFAULT_PARTY = 2

const slides = HERO_SLIDES
const tabs = HERO_SEARCH_TABS.filter((t) => !t.flag || FEATURES[t.flag])

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

/** Art-directed slide photo: portrait crop below 1024px, wide crop above. */
function SlidePicture({ slide, first }: { slide: HeroSlide; first: boolean }) {
  const common = { alt: slide.image.alt, fill: true, sizes: "100vw" } as const
  const loading = first ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const }
  const { props: tall } = getImageProps({ ...common, ...loading, src: slide.image.tall ?? slide.image.wide })
  const { props: wide } = getImageProps({ ...common, ...loading, src: slide.image.wide })
  return (
    <picture>
      <source media="(max-width: 1023px)" srcSet={tall.srcSet} sizes={tall.sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...wide} draggable={false} />
    </picture>
  )
}

export function HeroSection() {
  const router = useRouter()
  const { setIsAIAssistantOpen } = useApp()
  const reducedMotion = usePrefersReducedMotion()
  const ids = useId()

  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState(-1)
  // Only slides that have been shown (plus the next one) get an <img>, so
  // the rest of the deck isn't downloaded up front.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]))
  const [seam, setSeam] = useState<"idle" | "start" | "run">("idle")
  const [intro, setIntro] = useState(false)
  const [hover, setHover] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [hidden, setHidden] = useState(false)

  const [tabIndex, setTabIndex] = useState(0)
  const [where, setWhere] = useState("")
  const [when, setWhen] = useState("")
  const [party, setParty] = useState(DEFAULT_PARTY)

  const [topOffset, setTopOffset] = useState(36)

  const sectionRef = useRef<HTMLElement>(null)
  const activeRef = useRef(0)
  const seamTimer = useRef<number | undefined>(undefined)
  const swipeStart = useRef<number | null>(null)
  const swiped = useRef(false)

  const holding = hover || focusWithin || hidden
  const tab = tabs[tabIndex] ?? tabs[0]

  const go = useCallback((i: number) => {
    const n = slides.length
    const next = ((i % n) + n) % n
    const cur = activeRef.current
    if (next === cur) return
    activeRef.current = next
    setPrev(cur)
    setActive(next)
    setMounted((m) => (m.has(next) && m.has((next + 1) % n) ? m : new Set(m).add(next).add((next + 1) % n)))
    setSeam("start")
    requestAnimationFrame(() => requestAnimationFrame(() => setSeam("run")))
    window.clearTimeout(seamTimer.current)
    seamTimer.current = window.setTimeout(() => setSeam("idle"), SEAM_MS)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setIntro(true), 150)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(seamTimer.current)
    }
  }, [])

  // The hero fills the viewport below whatever sits above it (the test banner
  // wraps to several lines on phones), so measure instead of assuming 36px.
  useEffect(() => {
    const measure = () => {
      const el = sectionRef.current
      if (el) setTopOffset(Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    onVisibility()
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  // Autoplay: one timer per slide, dropped while holding and restarted on release.
  useEffect(() => {
    if (holding || reducedMotion || slides.length < 2) return
    const t = window.setTimeout(() => go(active + 1), SLIDE_MS)
    return () => window.clearTimeout(t)
  }, [active, holding, reducedMotion, go])

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    if (target.closest("input, select, textarea, [role='tablist']")) return
    if (e.key === "ArrowRight") go(activeRef.current + 1)
    else if (e.key === "ArrowLeft") go(activeRef.current - 1)
  }

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" || (e.target as HTMLElement).closest("[data-hero-sheet]")) return
    swipeStart.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (swipeStart.current == null) return
    const dx = e.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(dx) > SWIPE_PX) {
      swiped.current = true
      go(activeRef.current + (dx < 0 ? 1 : -1))
    }
  }
  // Hover pauses only over what people read or use (search, caption). The hero is
  // full-bleed, so pausing on any hover would freeze it whenever the mouse is on screen.
  const hoverPause = {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => e.pointerType === "mouse" && setHover(true),
    onPointerLeave: (e: PointerEvent<HTMLElement>) => e.pointerType === "mouse" && setHover(false),
  }

  const tap = (step: 1 | -1) => {
    if (swiped.current) {
      swiped.current = false
      return
    }
    go(activeRef.current + step)
  }

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (where.trim()) params.set("search", where.trim())
    if (when) params.set("date", when)
    if (party !== DEFAULT_PARTY) params.set("guests", String(party))
    const qs = params.toString()
    router.push(qs ? `${tab.route}?${qs}` : tab.route)
  }

  // With the planner flag off, fall back to the floating assistant like the old hero's "Ask AI".
  const plannerLink = FEATURES.AI_PLANNER
    ? { href: "/planner" }
    : {
        href: "#",
        onClick: (e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault()
          setIsAIAssistantOpen(true)
        },
      }

  const selectTab = (i: number) => {
    setTabIndex(i)
    setWhen("") // date vs. date-time differs per tab
  }

  const tabList = (mobile: boolean) => (
    <div
      role="tablist"
      aria-label="Search category"
      className={cn(
        "flex gap-1",
        mobile ? "ag-noscrollbar -mx-4 gap-1.5 overflow-x-auto px-4" : "ag-glass w-fit rounded-full p-1",
      )}
    >
      {tabs.map((t, i) => {
        const selected = i === tabIndex
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => selectTab(i)}
            className={cn(
              "flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full font-medium transition-[background-color,color] duration-300",
              mobile
                ? cn(
                    "border px-3.5 py-[9px] text-[13.5px]",
                    selected ? "border-[#0F1F14] bg-[#0F1F14] text-white" : "border-[#E2E1D8] bg-white text-[#0F1F14]",
                  )
                : cn("px-4 py-[9px] text-sm", selected ? "bg-white text-[#0F1F14]" : "text-white hover:bg-white/10"),
            )}
          >
            <t.icon className={mobile ? "size-[15px]" : "size-4"} strokeWidth={1.8} />
            {t.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured destinations"
      data-intro={intro ? "on" : "off"}
      onKeyDown={onKeyDown}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocusWithin(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={cn(
        poppins.variable,
        notoEthiopic.variable,
        "ag-hero relative isolate -mt-16 touch-pan-y overflow-hidden bg-[#0A1810] text-white lg:-mt-[84px] lg:touch-auto",
        "h-[calc(100svh-var(--ag-top))] min-h-[640px] lg:h-auto lg:min-h-[max(640px,calc(100svh-var(--ag-top)))]",
      )}
      style={{ "--ag-top": `${topOffset}px` } as CSSProperties}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="ag-slide"
            data-state={i === active ? "active" : i === prev ? "prev" : "off"}
            aria-hidden={i !== active}
            style={
              {
                "--ag-pos-w": s.image.focalWide ?? "center",
                "--ag-pos-t": s.image.focalTall ?? "center",
              } as CSSProperties
            }
          >
            {mounted.has(i) && <SlidePicture slide={s} first={i === 0} />}
          </div>
        ))}
      </div>
      <div className="ag-seam hidden lg:block" data-state={seam} />
      <div className="ag-hero__shade-v pointer-events-none absolute inset-0 z-[4]" />
      <div className="ag-hero__shade-h pointer-events-none absolute inset-0 z-[4]" />
      <div className="ag-hero__vignette pointer-events-none absolute inset-0 z-[4]" />

      {/* ───────── Desktop (≥1024) ───────── */}
      <div className="relative z-[5] hidden min-h-[inherit] flex-col px-8 pb-[130px] xl:px-[72px] pt-[118px] lg:flex [@media(max-height:820px)]:pb-14 [@media(max-height:820px)]:pt-[100px]">
        <div className="flex w-[780px] max-w-full flex-col items-start">
          <div className="ag-fade" style={{ "--ag-d": "0.05s" } as CSSProperties}>
            <div className="ag-glass flex items-center gap-2 rounded-full py-[7px] pl-2.5 pr-3.5 text-[13px] font-medium">
              <ShieldCheck className="size-4 text-[#B9E8B4]" strokeWidth={1.8} />
              Built in Ethiopia, for Ethiopia
            </div>
          </div>
          <h1 className="mt-[22px] text-[74px] font-bold leading-[1.02] tracking-[-0.04em] [@media(max-height:820px)]:text-[60px]">
            <span className="ag-line block">
              <span style={{ "--ag-d": "0.15s" } as CSSProperties}>Trusted stays &amp;</span>
            </span>
            <span className="ag-line block">
              <span style={{ "--ag-d": "0.27s" } as CSSProperties}>local intelligence</span>
            </span>
            <span className="ag-line block">
              <span style={{ "--ag-d": "0.39s" } as CSSProperties}>
                for <span className="text-[#B9E8B4]">Ethiopia.</span>
              </span>
            </span>
          </h1>
          <p
            className="ag-fade mt-[22px] max-w-[540px] text-lg leading-[1.6] text-white/88 [@media(max-height:820px)]:mt-4 [@media(max-height:820px)]:text-base"
            style={{ "--ag-d": "0.6s" } as CSSProperties}
          >
            Verified hotels, restaurants, transport and experiences — from budget stays to luxury retreats, discovered
            with local expertise.
          </p>
        </div>

        <div className="min-h-10 flex-1 [@media(max-height:820px)]:min-h-6" />

        <div className="ag-fade flex flex-col gap-3.5" style={{ "--ag-d": "0.8s" } as CSSProperties} {...hoverPause}>
          {tabList(false)}
          <DesktopSearchBar
            tab={tab}
            idPrefix={`${ids}-d`}
            where={where}
            when={when}
            party={party}
            onWhere={setWhere}
            onWhen={setWhen}
            onParty={setParty}
            onSubmit={submitSearch}
          />
          <div className="flex flex-wrap items-center gap-x-[26px] gap-y-2 pl-1.5 text-[13.5px] text-white/86">
            <span className="flex items-center gap-[7px]">
              <ShieldCheck className="size-[15px] text-[#B9E8B4]" strokeWidth={2} />
              Verified local listings
            </span>
            <span className="flex items-center gap-[7px]">
              <Star className="size-[15px] text-[#B9E8B4]" strokeWidth={2} />
              Curated across Ethiopia
            </span>
            <Link {...plannerLink} className="flex items-center gap-[7px] font-medium text-white hover:underline">
              <Sparkles className="size-[15px] text-[#B9E8B4]" strokeWidth={2} />
              Not sure where to go? Ask our AI planner →
            </Link>
          </div>
        </div>
      </div>

      {/* Caption (desktop, bottom-right) */}
      <div
        className="absolute bottom-[104px] right-[72px] z-[5] hidden h-[190px] w-[400px] xl:block"
        {...hoverPause}
        aria-live={holding ? "polite" : "off"}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="ag-caption absolute bottom-0 right-0 flex w-full flex-col items-end gap-2 text-right"
            data-active={i === active}
            aria-hidden={i !== active}
          >
            {s.nameAm && <div className="ag-am text-[46px] font-semibold leading-[1.1]">{s.nameAm}</div>}
            <div className="text-sm font-semibold uppercase tracking-[.16em]">
              {s.name}
              {s.region && ` · ${s.region}`}
            </div>
            {s.tagline && <p className="line-clamp-2 max-w-[340px] text-[14.5px] leading-[1.55] text-white/84">{s.tagline}</p>}
            <Link
              href={s.href}
              tabIndex={i === active ? undefined : -1}
              className="mt-1 flex items-center gap-2 border-b border-white/50 pb-[3px] text-sm font-semibold hover:border-white"
            >
              Stays in {s.linkLabel}
              <ArrowRight className="size-[15px]" strokeWidth={2} />
            </Link>
          </div>
        ))}
      </div>

      {/* ───────── Mobile (<1024) ───────── */}
      <div className="absolute left-4 top-[78px] z-[6] h-9 w-[300px] lg:hidden" aria-live={holding ? "polite" : "off"}>
        {slides.map((s, i) => (
          <div key={s.id} className="ag-place absolute left-0 top-0" data-active={i === active} aria-hidden={i !== active}>
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/22 bg-white/14 py-[7px] pl-2 pr-3.5 backdrop-blur-md">
              {mounted.has(i) && (
                <Image
                  src={s.image.tall ?? s.image.wide}
                  alt=""
                  width={44}
                  height={44}
                  className="size-[22px] rounded-full object-cover"
                />
              )}
              {s.nameAm && <span className="ag-am text-[13px] font-semibold">{s.nameAm}</span>}
              <span className="text-[12.5px] opacity-85">{s.name}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        tabIndex={-1}
        aria-label="Previous destination"
        onClick={() => tap(-1)}
        className="absolute left-0 top-[130px] z-[5] h-[200px] w-[35%] lg:hidden"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Next destination"
        onClick={() => tap(1)}
        className="absolute right-0 top-[130px] z-[5] h-[200px] w-[65%] lg:hidden"
      />

      <div className="pointer-events-none absolute inset-x-5 bottom-[318px] z-[6] flex flex-col gap-3 lg:hidden">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#B9E8B4]">
          <ShieldCheck className="size-3.5" strokeWidth={2} />
          Built in Ethiopia, for Ethiopia
        </div>
        <h1 className="text-[39px] font-bold leading-[1.04] tracking-[-0.035em]">
          <span className="ag-line block pb-[3px]!">
            <span style={{ "--ag-d": "0.15s" } as CSSProperties}>Trusted stays &amp;</span>
          </span>
          <span className="ag-line block pb-[3px]!">
            <span style={{ "--ag-d": "0.27s" } as CSSProperties}>local intelligence</span>
          </span>
          <span className="ag-line block pb-[5px]!">
            <span style={{ "--ag-d": "0.39s" } as CSSProperties}>
              for <span className="text-[#B9E8B4]">Ethiopia.</span>
            </span>
          </span>
        </h1>
      </div>

      <form
        data-hero-sheet
        onSubmit={submitSearch}
        className="absolute inset-x-0 bottom-0 z-[7] flex h-[302px] flex-col gap-3 rounded-t-[28px] bg-[#F7F6F1] px-4 pt-[18px] text-[#0F1F14] lg:hidden"
      >
        {tabList(true)}
        <label className="flex h-[58px] items-center gap-3 rounded-2xl border border-[#E2E1D8] bg-white px-4 focus-within:border-[#006911]">
          <MapPin className="size-5 shrink-0 text-[#006911]" strokeWidth={1.8} />
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-[10.5px] font-semibold uppercase tracking-[.12em]">{tab.where}</span>
            <input
              id={`${ids}-m-where`}
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder={tab.whereHint}
              enterKeyHint="search"
              className="w-full min-w-0 text-ellipsis bg-transparent text-[14.5px] outline-none placeholder:text-[#5E6B62]"
            />
          </span>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#006911] text-[15.5px] font-semibold text-white transition-colors hover:bg-[#004D0C]"
          >
            <Search className="size-[18px]" strokeWidth={2.2} />
            {tab.cta}
          </button>
          <Link
            {...plannerLink}
            aria-label="Plan with AI"
            className="flex size-[54px] items-center justify-center rounded-2xl border-[1.5px] border-[#0F1F14] text-[#0F1F14]"
          >
            <Sparkles className="size-5" strokeWidth={1.8} />
          </Link>
        </div>
        <div className="flex justify-center gap-4 text-xs text-[#46544A]">
          {["Verified", "Curated", "AI trip planning"].map((label) => (
            <span key={label} className="flex items-center gap-[5px]">
              <Check className="size-[13px] text-[#006911]" strokeWidth={2.2} />
              {label}
            </span>
          ))}
        </div>
      </form>
    </section>
  )
}

function DesktopSearchBar({
  tab,
  idPrefix,
  where,
  when,
  party,
  onWhere,
  onWhen,
  onParty,
  onSubmit,
}: {
  tab: HeroSearchTab
  idPrefix: string
  where: string
  when: string
  party: number
  onWhere: (v: string) => void
  onWhen: (v: string) => void
  onParty: (v: number) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}) {
  const field = "flex items-center gap-3 rounded-2xl px-[18px] py-2.5 transition-colors hover:bg-white/12 focus-within:bg-white/12"
  const label = "text-[11px] font-semibold uppercase tracking-[.12em] text-white"
  const hint = "truncate text-[14.5px] text-white/78"
  const divider = <div className="h-9 w-px shrink-0 bg-white/20" aria-hidden />

  const whenLabel = when
    ? new Date(tab.whenType === "date" ? `${when}T00:00` : when).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        ...(tab.whenType === "datetime-local" ? { hour: "numeric", minute: "2-digit" } : {}),
      })
    : tab.whenHint

  return (
    <form
      onSubmit={onSubmit}
      className="ag-searchbar flex w-[760px] max-w-full items-center rounded-[22px] p-2 xl:w-[min(760px,calc(100vw-616px))] 2xl:w-[760px]"
    >
      <label htmlFor={`${idPrefix}-where`} className={cn(field, "min-w-0 flex-[1.5] cursor-text")}>
        <MapPin className="size-5 shrink-0 text-[#B9E8B4]" strokeWidth={1.8} />
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className={label}>{tab.where}</span>
          <input
            id={`${idPrefix}-where`}
            value={where}
            onChange={(e) => onWhere(e.target.value)}
            placeholder={tab.whereHint}
            className="w-full min-w-0 text-ellipsis bg-transparent text-[14.5px] text-white outline-none placeholder:text-white/78"
          />
        </span>
      </label>
      {divider}
      <label className={cn(field, "relative min-w-0 flex-1 cursor-pointer")}>
        <Calendar className="size-5 shrink-0 text-[#B9E8B4]" strokeWidth={1.8} />
        <span className="flex min-w-0 flex-col gap-px">
          <span className={label}>{tab.when}</span>
          <span className={hint}>{whenLabel}</span>
        </span>
        {/* Native picker sits invisibly over the field so it stays keyboard/AT friendly. */}
        <input
          key={tab.whenType}
          type={tab.whenType}
          aria-label={tab.when}
          value={when}
          onChange={(e) => onWhen(e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      {divider}
      <label className={cn(field, "relative min-w-0 flex-[.9] cursor-pointer")}>
        <Users className="size-5 shrink-0 text-[#B9E8B4]" strokeWidth={1.8} />
        <span className="flex min-w-0 flex-col gap-px">
          <span className={label}>{tab.who}</span>
          <span className={hint}>
            {party} {tab.whoUnit}
          </span>
        </span>
        <select
          aria-label={tab.who}
          value={party}
          onChange={(e) => onParty(Number(e.target.value))}
          className="absolute inset-0 cursor-pointer text-[#0F1F14] opacity-0"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {tab.whoUnit}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-[#006911] px-6 py-[17px] text-[15px] font-semibold text-white transition-colors hover:bg-[#004D0C]"
      >
        <Search className="size-[18px]" strokeWidth={2.2} />
        {tab.cta}
      </button>
    </form>
  )
}
