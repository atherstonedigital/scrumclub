# CLAUDE.md — Scrum Club Shopify Build

**Repo:** `atherstonedigital/scrumclub` · **Store:** `scrum-club-2.myshopify.com` (Dev plan, GBP, UK)
**Base theme:** Pitch (Horizon family, theme-blocks architecture) · **Theme ID:** `199166296398`
**Visual source of truth:** the realised homepage mock `Scrum_Club_Homepage_Mock_1` ("Prestige"), reconciled with the brand deck `SCRUMCLUB.pdf` (June 2026).
**Read this file at the start of every session before touching the repo.**

---

## 0. Non-negotiable working rules (read first, every time)

1. **Never edit Pitch core files.** All custom work goes in net-new, prefixed files: `sections/sc-*.liquid`, `blocks/sc-*.liquid`, `snippets/sc-*.liquid`, `assets/sc-*.css`, `assets/sc-*.js`. Horizon updates weekly; editing core means every update is a merge conflict. If a core block looks like it needs changing, duplicate it to an `sc-` file and change that instead. **The one sanctioned exception** is the single documented include block already in `layout/theme.liquid` that wires the token layer — do not add others.
2. **The contested zone is `config/settings_data.json` and the template JSONs.** Structure (which sections/blocks exist, schema, defaults) lives in Git. Content and merchandising live in the Shopify editor. Do not author the same JSON file from both Git and the editor — a sync will clobber one side. When adding a section to a template, prefer doing it via the editor and pulling, or commit the JSON deliberately and note it in the PR.
3. **Colours come from code, not the admin colour picker.** Horizon has a known bug that misrenders warm off-whites; `--paper` (`#F4F1EC`) is exactly the value it breaks. The palette is set in `snippets/sc-brand-tokens.liquid`. Do not re-enter brand hexes into theme settings.
4. **One PR per logical unit.** Small, reviewable diffs. Branch naming: `sc/<area>-<thing>` e.g. `sc/home-hero`, `sc/pdp-template`.
5. **Never silently work around a missing decision or asset.** If a build step needs a decision from §6 or an asset that doesn't exist, stop and flag it in the PR description rather than inventing a placeholder that looks final. The mock marks every image `Photo TBC` for this reason.

---

## 1. Current repo state

Already built and committed — **do not recreate** (the token layer, `sc/brand-tokens`):

- `snippets/sc-fonts.liquid` — Google Fonts load (Anton, Saira Condensed, Archivo, JetBrains Mono)
- `snippets/sc-brand-tokens.liquid` — CSS custom properties (colour, type, spacing, radii, shadow, motion). **Mirrors the mock's `:root`.**
- `assets/sc-brand.css` — brand utility classes and light base restyle
- `layout/theme.liquid` — single documented include wiring the above in (after Pitch's own palette, so brand tokens win the cascade)

**These files are the source of truth for all brand values.** Do not duplicate hexes, font stacks, or spacing values into new files — reference the CSS variables (`var(--try)`, `var(--font-display)`, `var(--s-7)` etc.). If a value is missing from the token layer, add it there, don't hard-code it locally.

### Also built (do not recreate)
- **Homepage** (`templates/index.json`): `sc-home-hero`, `sc-marquee`, `sc-featured-collection` (+ `snippets/sc-product-card` + `assets/sc-product-card.css`), `sc-media-text`, `sc-shop-by-fit`, `sc-shop-the-look`, `sc-journal`, `sc-trust-row`, `sc-newsletter`.
- **Chrome (Phase B started)**: `header-group.json` uses the site-wide `sc-announcement`; `footer-group.json` restyled to pitch with Shop/Club/Support columns (menus `footer-shop` / `footer-club` / `footer-support` to be created in admin).
- **Support pages**: `sc-page-header`, `sc-rich-text`, `sc-founders`, `sc-faq`, `sc-size-guide` + templates `page.about` / `page.commitment` / `page.faq` / `page.size-guide`.
- **PDP** (`templates/product.json`, §3.2): reuses Pitch media/variant/buy blocks; brand blocks `blocks/sc-pdp-eyebrow`, `sc-pdp-title`, `sc-pdp-spec`, and the reusable `sc-trust-5pct` (§3.3); related row is `sc-related-products` using `sc-product-card`. `assets/sc-pdp.css` remaps Pitch's `--font-*--family` vars to brand fonts scoped to `[data-template^="product"]`, so native blocks inherit Anton/Saira/Archivo. References `product.metafields.scc.*` with fallbacks.
- **PLP** (`templates/collection.json`, §3.6): `sc-collection` — native filtering/sorting/pagination rendered with `sc-product-card`; fem/men fit bar driven by the `scc.fit` filter.

### Step 0 before any new section work — verify the token layer
Run `shopify theme dev` and confirm on a real page:
- Page background renders as warm paper `#F4F1EC`, **not** white or grey (this is the Horizon colour bug check).
- Anton renders on headings, Saira Condensed (800 italic) on eyebrows/pills/buttons, Archivo on body, JetBrains Mono on spec lines.
- The cut-shadow utility (`6px 6px 0 var(--try)`) renders sharp, not blurred, on `.sc-btn--primary`.

> Note: `shopify theme dev` needs the Shopify CLI + store auth, which are **not** available in the cloud session — run this check locally before building on top.

---

## 2. Brand discipline (encode as acceptance criteria, not suggestions)

The realised look is **paper-led, not black-led**: a warm `--paper` canvas (~80%), dark `--pitch` bands for the hero / inverted sections, a red `--try` marquee, and red as the single loud accent. Every section must pass these before its PR is opened:

- **80 / 15 / 5 colour ratio.** ~80% paper-or-pitch surface, ~15% steel/grit/bone neutrals, ~5% Try-red. Red is a whistle, not a wash — CTAs, the marquee, and single accents only. `--turf` (green) and `--whistle` (yellow) are *sparing* functional accents, not surfaces.
- **One motif per composition.** Halftone dots, slash, and pitch-lines never appear together in one section.
- **Cut-shadow (`var(--cut)` = `6px 6px 0 var(--try)`) only on hero CTAs and stat blocks.** Never on cards. Soft drop-shadows are modals/drawers only.
- **Type:** headings left-aligned, never centred. Anton is CAPS only. Eyebrows/buttons are **Saira Condensed 800 italic**. Never mix Anton + Saira in one line. Body max 64ch.
- **Sharp corners.** Radius 0/2/4/8 only; pills (999) for tags/chips only. Buttons use 2px.
- **No decorative colour gradients, no glassmorphism** (sticky/transparent header is the only exception). The only sanctioned gradient is the near-black depth on `--pitch` surfaces (e.g. the hero `linear-gradient(180deg,#0d0d11,#0B0B0E)`) and gradients baked into supplied logo art.
- **Banned words in any copy:** elevate, unleash, redefine, reimagined. No Title Case headings (CAPS or sentence case only). No emoji anywhere in product/marketing/UI.
- **Tagline is locked, verbatim:** `PLAY STRONG. LOOK FIERCE. BE UNSTOPPABLE.` — **full stops, caps**, display face, never paraphrased.

Motion (use the existing tokens): `--ease-tackle` `cubic-bezier(.85,0,.15,1)` for buttons/toggles/state; `--ease-kick` `cubic-bezier(.22,1,.36,1)` for reveals. Hero copy fades + translates up 24px on enter (520ms kick). Button hover try→try-bright, translate(-2px,-2px); press→crimson, settles to 0, no shrink. Card hover = 1px inner border + corner slash extends 8px, no shadow lift. No bouncy/wobbly motion.

### Palette (from `sc-brand-tokens.liquid`)

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F4F1EC` | primary canvas (warm off-white) |
| `--pitch` | `#0B0B0E` | dark band surface (hero, inverted, footer) |
| `--mud` | `#1A1814` | deepest brown-black |
| `--steel` | `#2A2D33` | body-copy ink on paper / raised dark cards |
| `--grit` | `#5A5E66` | muted text, hairlines |
| `--fog` | `#9CA0A8` | dimmed text on pitch |
| `--bone` | `#D4CFC2` | warm neutral borders/fills on paper |
| `--chalk` | `#E9E5DC` | light text/fills on dark |
| `--try` | `#E1261C` | **primary accent (red whistle)** |
| `--try-bright` | `#FF3A2D` | hover |
| `--crimson` | `#8C1410` | pressed |
| `--turf` | `#2F6F3E` | green, sparing accent |
| `--whistle` | `#F5C518` | yellow, sparing accent / slash |
| `--chic` | `#D01060` | ScrumChic magenta — **deferred, token only** |
| `--sleek` | `#5FA0A0` | ScrumSleek teal — **deferred, token only** |

---

## 3. Build sequence

Build in this order. Each is its own branch + PR.

### 3.1 — Home hero / manifesto `sections/sc-home-hero.liquid`
First real composition; doubles as the token-layer smoke test. Per the mock: `.sc-pitch` dark hero, min-height ~88vh, Anton `.sc-display` headline at `clamp(72px,11vw,168px)`/0.86/−0.01em with a `.red` accent word, Saira 800-italic eyebrow (`AW26 · MATCHDAY DROP`), `.sc-btn--primary` (Try-red + cut-shadow) plus a ghost CTA, faint watermark mark at 6% opacity. Hero reveal animation per §2. Schema-driven: eyebrow, headline (with optional red span), subcopy, two CTAs (label + link), surface toggle (paper/pitch), background image. Mock headline + copy: *"Built for the women's game."* / *"Rugby kit and protective wear drafted from a women's body block — not shrunk down from a men's one. Tested in the mud. Made in the UK."*

### 3.2 — PDP template `sections/sc-pdp-*.liquid` (+ blocks)
Composition (per mock product cards + PDP intent):
- Saira eyebrow (e.g. `FEM-FIT · MATCH`) — driven by the `fit` + category metafields
- Anton product title · `£` price
- Size pills — **Fem-Fit numeric** (6/8/10/12/14), **Men-Fit alpha** (S/M/L/XL). Size is the **variant option**.
- **ADD TO BAG** button with `var(--cut)`
- Mono spec line: `SKU … · MADE IN UK · 5% TO RESEARCH`

**Dependency — metafields must exist on the store first** (see §5). Build the PDP to degrade gracefully if a metafield is absent (hide the line, don't render an empty label). Reference them as `product.metafields.sc.fit` etc. once the namespace is confirmed.

**Product model is fixed:** fem-fit and men's-fit are *separate products*, never a Fit variant. Colourways are *separate products* too. Size is the only variant axis.

### 3.3 — `sc-trust-5pct` **block** (not a section)
The 5%-to-research signal recurs on PDP, footer, and About. Author it once as a reusable Horizon block, place it in all three. Treat the figure as audited fact, not marketing. Mock copy: *"Five percent of every order funds research into women's rugby — injury prevention, performance, participation. Audited annually and reported in the open. Not a campaign. A standing commitment."*

### 3.4 — Remaining home bands (mock section sequence)
Build the homepage to match the mock's "Prestige" order. All schema-driven so the client merchandises in the editor:

1. **Announcement bar** — `MADE IN UK · 5% OF EVERY ORDER FUNDS RESEARCH · FREE UK SHIPPING OVER £75`
2. **Header** (sticky, transparent) — nav: Shop · Fem-Fit · Men-Fit · Club Rugby · Journal · Search · Account · Bag
3. **Hero** (3.1)
4. **Marquee** — red `--try` band, Anton, scrolling tagline (locked form per §2)
5. **Featured collection** — product card grid (eyebrow chips In stock / New In, size pills, Add to bag)
6. **Image with text** — Fem-Fit match range
7. **Dynamic grid** — Shop by fit (Fem-Fit / Men-Fit)
8. **Image hotspot** — Shop the look / lookbook
9. **Image with text (inverted, `.sc-pitch`)** — the 5% commitment (places 3.3)
10. **Blog posts** — Journal row (Tracksmith-style 3-up grid)
11. **Text with icons** — trust row: Made in the UK · 5% to research · Contact-tested · Self-fulfilled
12. **Newsletter** — "Join the club / First drops. No noise."
13. **Footer group** — columns Shop / Club / Support

### 3.5 — About `templates/page.about.json` + `sections/sc-about-*.liquid`
Founders (Sam & Nathan — bios in the deck pp.3–4), the story, the 5% commitment (places 3.3). Founder portraits are an asset dependency — see §7.

### 3.6 — Phase B: theme-default restyles (tokens only, minimal new Liquid)
Collection/PLP (with fem/men filtering), cart, search, account, blog listing/detail, contact form, policy pages, 404. These ride on Pitch defaults restyled by the token layer — do not rebuild them. The 404 gets one custom on-brand section (pitch surface + one motif).

---

## 4. Horizon-specific guidance

- **Blocks vs sections:** anything reused across templates is a **block** (the 5% signal; product card). Page-structural one-offs are sections. Horizon supports deep block nesting — use it for composition rather than building monolithic sections.
- **Scoped CSS/JS per block.** Keep a block's styles in its own `{% stylesheet %}` / `assets/sc-<block>.css` and JS in `{% javascript %}`, not dumped into a global file. Global brand values still come from the token layer.
- **Let Horizon handle images.** It does responsive images, lazy loading, and product/breadcrumb/article schema by default — don't reimplement these.

---

## 5. Metafields (define before PDP build)

Define on the store (via the Shopify MCP connector or admin), then reference in Liquid:

| Key | Type | Notes |
|---|---|---|
| `fit` | single line / list | fem / men |
| `sku_code` | single line | e.g. `SC-FF-J01` |
| `chest_cm` / `length_cm` | sizing table | storage format is an **open decision** — see §6 |
| `made_in` | single line | "United Kingdom" — **verify, currently a placeholder** |
| `house` | single line / list | Scrum Club (future: ScrumChic, ScrumSleek, Strike, Scrumdog, Grit) |

**Namespace: `scc`** (Scrum Club) — resolved 2026-06-24. A dedicated, brand-owned namespace that won't collide with app metafields that dump into `custom`. All theme Liquid references `product.metafields.scc.*`. Storefronts access ON (required for filtering + Liquid).

Keys in use by the theme:
| Key | Type | Used by | Notes |
|---|---|---|---|
| `fit` | single line text | PDP eyebrow, PLP fit filter, product card | values `Fem-Fit` / `Men-Fit` |
| `made_in` | single line text | PDP spec line | store `UK` → "MADE IN UK"; verify §6 #5 |
| `sku_code` | single line text | PDP spec line | optional — falls back to variant SKU |
| `house` | single line text | future | default `Scrum Club` |
| `benefits` | **list.single_line_text** | PDP benefits block | e.g. "Two-way stretch", "Mud-tolerant", "Contact-tested" |

Optional/recommended next (define when content's ready, theme can surface on request): `fabric` (single line — composition), `care` (multi-line — wash care), `fit_notes` (single line — e.g. "Athletic fit; size up for layering").

---

## 6. Open decisions — do not build past these without a call

**Resolved (2026-06-24):**
- ✅ **Visual source of truth:** the homepage mock governs; deck is the brand input behind it.
- ✅ **Tagline punctuation:** full stops — `PLAY STRONG. LOOK FIERCE. BE UNSTOPPABLE.` (matches the mock).
- ✅ **Brand model:** one brand now (Scrum Club; Fem-Fit / Men-Fit are fits, not sub-brands). ScrumChic / ScrumSleek deferred (tokens reserved).

**Still open:**
1. ✅ **Metafield namespace:** resolved — **`scc`** (2026-06-24). Theme references `product.metafields.scc.*`.
2. **Sizing storage format:** text ranges vs split min/max integers for `chest_cm`/`length_cm`. *(Blocks the PDP sizing table.)*
3. **Club Rugby Package page type:** buyable product, bespoke-quote enquiry form, or content page. Appears in mock nav + footer (and a "Kit Builder ↗"). *(Blocks that page.)*
4. **Kids items (SC010, SC011):** in Phase 1 scope? *(Affects catalogue + collections.)*
5. **`made_in` verification:** confirm "United Kingdom" is accurate per SKU before it ships in the mono spec line.

---

## 7. Asset dependencies (the real launch gate — flag early, not at QA)

| Asset | Status | Blocks |
|---|---|---|
| Product photography | No library exists — mock marks every image `Photo TBC` | All PDPs, home hero, PLP. **Highest risk.** Flat-lay is the floor. |
| Founder portraits | Not confirmed | About page |
| Logo vector (SVG) | PNG only, no vector (deck shows old vs new logos as raster) | Crisp render, favicon, retina |
| Product copy | Pending Sam & Nathan sign-off | PDP body. Voice: coach, not CMO. |

Photography is the critical path, not the code. If it hasn't landed, the build is a styled shell with placeholders — say so to the client, don't paper over it.

---

## 8. Definition of done (per PR)

- Renders correctly at mobile / tablet / desktop (gutters 24 / 48 / 80px; desktop breakpoint 1100px).
- Passes every §2 acceptance criterion.
- One H1 per page; semantic heading order; alt text on images.
- No edits to Pitch core files (the one token-layer include excepted); all new work in `sc-*` files.
- LCP image (hero) compressed.
- Diff is small and the PR description names any decision/asset it's waiting on.
