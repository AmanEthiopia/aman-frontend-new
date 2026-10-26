# Algalle — Brand Guide

> አልጋ አለ · "there is a bed" · algalle.com
> A Yichalal Family Initiative

This is the single reference for Algalle's visual identity as finalized in this
version (v1). Save it; we'll refine for v2.

---

## 1. Name & meaning

- **Name:** Algalle (Amharic **አልጋ አለ**, "there is a bed").
- **Promise:** "there is a bed for you" — a warm, ready, trustworthy place to stay/travel.
- **Note on spelling:** the brand assets use **"Algalle"**; the product UI currently
  renders the wordmark as **"Algalle"** (same name, same Amharic). Unifying the Latin
  spelling is a v2 decision — flagged here, not yet changed across the app.

---

## 2. The mark — "The Resting Arch"

An **arch** (doorway + roof = shelter, welcome) holding a **made bed** with a single
**gold pillow** — the warm spot waiting for you.

**Asset files** (`public/brand/`):

| File | Use |
|---|---|
| `algalle-mark-green.svg` | Primary — green mark on **light** backgrounds |
| `algalle-mark-reverse.svg` | Cream mark — for **dark / green** backgrounds |
| `algalle-mark-mono.svg` | One-color (espresso) — single-ink contexts |
| `algalle-appicon.svg` | App icon — cream mark on a green rounded tile |
| `algalle-favicon.svg` | Favicon — heavier strokes for 16px legibility |
| `algalle-lockup-horizontal.svg` | Mark + "Algalle" + አልጋ አለ |
| `icon.svg` | Browser tab icon (app-icon style), referenced by `app/layout.tsx` |

**Rules**
- Clear space = the arch's width on all sides.
- Minimum symbol size **16px**.
- **Keep the gold pillow gold** — it is the single accent in the mark.
- Do **not** stretch, rotate, recolor off-brand, or restyle the strokes.

**In code:** use the shared component, never re-implement the mark.
```tsx
import { AlgalleWordmark, AlgalleMark } from "@/components/brand/algalle-logo"

<AlgalleWordmark size={36} />                 // mark + "Algalle" + አልጋ አለ (light bg)
<AlgalleWordmark size={36} reverse />         // cream mark + light text (dark/green bg)
<AlgalleMark size={28} />                      // mark only
```

---

## 3. Color palette

### Core
| Token | Hex | Role |
|---|---|---|
| Highland Green | `#0E5C43` | primary · trust · brand ink |
| Meskel Gold | `#E3A92C` | secondary · welcome · the one spark |
| Coffee Cherry | `#C0432F` | accent · energy · **one CTA per screen** |

### Deep / dark
| Token | Hex | Role |
|---|---|---|
| Forest 800 | `#073022` | dark sections, reverse lockups |
| Forest 900 | `#04231A` | deepest panels |

### Neutrals
| Token | Hex | Role |
|---|---|---|
| Netela Cream | `#FAF6EE` | background |
| Cotton White | `#FFFDF9` | cards |
| Sand | `#F0E9DA` | bands / dividers |
| Border | `#E7E0D2` | hairlines |
| Stone | `#A89E8E` | placeholders |
| Muted Espresso | `#6B6258` | captions / secondary text |
| Buna Espresso | `#211B15` | primary text |

### Usage ratio
**60% neutrals · 30% green · 10% gold · a spark of cherry.**
Never white text on gold — use espresso (`#211B15`).

### How this maps to the live theme (`app/globals.css`)
The app theme is already brand-aligned (green primary, gold secondary, cherry accent),
expressed in `oklch`:

| CSS var | Light value | Brand meaning |
|---|---|---|
| `--primary` | `oklch(0.45 0.15 145)` | Highland Green |
| `--secondary` | `oklch(0.85 0.12 85)` | Meskel Gold |
| `--accent` | `oklch(0.55 0.2 25)` | Coffee Cherry |
| `--background` | `oklch(0.99 0.005 90)` | Netela Cream |
| `--foreground` | `oklch(0.15 0.02 60)` | Buna Espresso |

> v2 idea: pin these `oklch` values to the exact hex above for pixel-accurate brand color.

---

## 4. Typography

| Use | Typeface |
|---|---|
| Display / wordmark | **Fraunces** (600) |
| UI / body | **Inter** |
| Geʼez / Amharic | **Noto Sans Ethiopic** |
| Numbers / codes | **Geist Mono** |

---

## 5. Where it's applied (this version)

- **Logo (Resting Arch):** main site header, traveler dashboard header, provider
  dashboard (sidebar + top bar), and the footer — all via `AlgalleWordmark`.
- **Favicon / tab icon:** `public/brand/icon.svg` (cream arch on green tile).
- **Guides page hero** (`/guides`): restyled from the old slate-gradient to the
  **green "Premium Concierge" pitch** treatment — `bg-primary` + the
  `abstract-geometric-pattern` overlay, gold highlight on the headline — so it matches
  the rest of the platform's brand tone (front/hero only; the listings below are unchanged).
- **Premium Concierge pitch** (`/concierge`): the reference green hero this tone was matched to.

---

## 6. Decisions log (v1)

- Adopted the "Resting Arch" mark across traveler + provider + footer + favicon.
- Kept the existing green/gold/cherry theme (already brand-aligned) rather than
  re-theming — documented the exact hex targets for v2.
- Unified the Guides hero with the Premium pitch for one consistent brand feel.
- **Open for v2:** finalize Latin spelling ("Algalle" vs "Algalle") across UI;
  optionally pin theme `oklch` to exact brand hex; load Fraunces for the wordmark.
