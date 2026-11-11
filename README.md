# Baladi Store (`بلدي`)

Bilingual (**Arabic RTL / English LTR**) e-commerce storefront for **BALADI (بلدي)** — Egyptian dry food for cats and dogs by Giza Pet Food (GPF). Features an interactive 3D packaging showroom, species-specific visual identities, 10-second cart/checkout grace windows, and a plug-and-play shipping integration for **Porter Express Egypt**.

---

## Features

- **Interactive 3D Packaging Showroom** (`src/components/hero/Baladi3DHero.tsx`, `src/components/hero/BaladiPouch3DViewer.tsx`)
  - Real-time **Three.js + GLTFLoader** viewer for cat and dog pouches (`public/brand/baladi_pouch_cat.glb`, `public/brand/baladi_pouch_dog.glb`).
  - Splits pouch geometry cleanly into **front** and **back** faces with metallic gold side gussets and dynamically switches between 8 preloaded Arabic/English front-and-back textures when toggling language (`ar` ↔ `en`).
  - Full 360° pointer drag rotation, subtle hover tilt, and animated mode transitions (`both`, `cats`, `dogs`).
- **Bilingual Support (`AR` / `EN`)** (`src/lib/lang.tsx`)
  - Defaults to Arabic (`dir="rtl"`) with instant LTR English switching persisted in `localStorage` under `baladi-lang`.
- **Species Worlds & Product Catalog** (`src/data/catalog.ts`, `src/pages/World.tsx`, `src/pages/ProductPage.tsx`)
  - Coral red (`#E84249`) theme and geometric cat emblems for feline products; emerald green (`#1E996C`) theme and geometric dog emblems for canine products.
  - Full-frame uncropped product pouch display (`object-contain`), complete guaranteed analysis breakdown, vitamin panel, and feeding notes aligned with Egyptian Standard `3215/2002`.
- **10-Second Cart & Order Grace Periods** (`src/store/cart.ts`, `src/pages/ProductPage.tsx`, `src/pages/CheckoutPage.tsx`)
  - **Add-to-Cart Grace Timer (`ADD_GRACE_SECONDS = 10`)**: Shows a live 10-second progress countdown directly on the button so customers can adjust quantity or cancel; navigating away (`Layout.tsx`) or opening the cart early commits the item automatically so nothing is lost.
  - **Checkout Dispatch Grace Modal (`GRACE_PERIOD_SECONDS = 10`)**: Gives customers 10 seconds (visible both inside the modal and on the confirm button) to review or cancel before final order creation and carrier dispatch.
- **Porter Express Egypt Shipping Adapter** (`src/lib/shipping/`)
  - Ready-to-use shipment dispatch, tracking URL generation, Egyptian governorate delivery estimates (`getEstimatedDeliveryDays`), weight parsing (`parseWeightToKg`), and phone normalization (`normalizeEgyptianPhone`).
  - Works out of the box in sandbox mode and switches to live REST API calls once production credentials are provided via Vite environment variables.
- **Cart Drawer, Search & Customer Profiles** (`CartDrawer.tsx`, `SearchPage.tsx`, `ProfilePage.tsx`, `src/store/auth.ts`)
  - Persistent Zustand stores for cart lines, customer addresses, registered pets, and order tracking history.

---

## Tech Stack

| Category | Packages / Tools |
| --- | --- |
| Framework & Build | React 18, TypeScript `~5.6.3`, Vite 5 |
| Styling | Tailwind CSS 3 (`Cairo` & `Montserrat` fonts, custom `ink` / `cream` / `sand` / `baladi` tokens) |
| 3D Graphics | `three` + `GLTFLoader` |
| State Management | `zustand` (with `persist` middleware) |
| Routing | `react-router-dom` v6 (`HashRouter`) |
| UI & Motion | `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge` |
| i18n | Custom `LangProvider` + `i18next` / `react-i18next` |

---

## Project Structure

```text
baladi-store/
├── index.html                  # Root HTML (lang="ar", dir="rtl", Cairo & Montserrat fonts)
├── package.json                # Scripts & dependencies
├── tailwind.config.ts          # Theme palette, font families, shadows & animations
├── vite.config.ts              # Vite configuration & `@` alias -> ./src
├── vercel.json                 # SPA rewrite configuration for Vercel
├── public/
│   ├── favicon.svg
│   ├── brand/
│   │   ├── baladi_pouch_cat.glb
│   │   ├── baladi_pouch_dog.glb
│   │   └── 3d/                 # Bilingual 512x1024 textures (front & back per species/lang)
│   └── images/hero bg/         # 100 WebP hero sequence frames (00000..00099.webp)
└── src/
    ├── main.tsx                # HashRouter & route definitions
    ├── index.css               # Global Tailwind & custom styles
    ├── data/catalog.ts         # Product catalog, nutrition analysis & species metadata
    ├── lib/
    │   ├── lang.tsx            # Bilingual RTL/LTR context & `t(ar, en)` helper
    │   ├── utils.ts
    │   └── shipping/           # Porter Express config, types & dispatch client
    ├── store/
    │   ├── cart.ts             # Cart state + 10s pending-add state machine
    │   └── auth.ts             # User profile, saved addresses, pets & orders store
    ├── components/
    │   ├── brand/              # Geometric cat/dog emblems & decorative Ornaments
    │   ├── hero/               # CinematicHero, Baladi3DHero & BaladiPouch3DViewer
    │   ├── layout/             # Header, Footer, Layout, CartDrawer & SearchModal
    │   ├── sections/           # ProductCard
    │   └── ui/                 # Reveal & Tilt3D
    └── pages/                  # Home, World, ProductPage, CartPage, CheckoutPage,
                                # Story, SearchPage, LoginPage, RegisterPage,
                                # ForgotPasswordPage, ProfilePage, NotFound
```

---

## Routes

Defined in `src/main.tsx` inside `<HashRouter>`:

| Path | Page |
| --- | --- |
| `/` | `Home` |
| `/cats`, `/cats/:sub` | `World` (Cats catalog & subcategories) |
| `/dogs`, `/dogs/:sub` | `World` (Dogs catalog & subcategories) |
| `/product/:slug` | `ProductPage` |
| `/cart` | `CartPage` |
| `/checkout` | `CheckoutPage` |
| `/story` | `Story` |
| `/search` | `SearchPage` |
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/forgot-password` | `ForgotPasswordPage` |
| `/profile`, `/account` | `ProfilePage` |
| `*` | `NotFound` |

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended) and `npm`

### Installation & Local Development

```bash
npm install
npm run dev
```

### Production Build & Preview

```bash
npm run build     # Runs `tsc -b && vite build` -> outputs to ./dist
npm run preview   # Previews production bundle at http://localhost:4173
```

---

## Shipping Integration (Porter Express Egypt)

Shipping configuration lives in `src/lib/shipping/config.ts`. By default, `PORTER_CONFIG` runs in **sandbox mode** so checkout flows work without live credentials.

To enable live dispatch, create a `.env.local` file and set the following Vite environment variables:

```env
VITE_PORTER_PROD=true
VITE_PORTER_API_KEY=your_live_bearer_token
VITE_PORTER_API_URL=https://api.porterexpress.eg/v1
VITE_PORTER_MERCHANT_ID=GPF-BALADI-STORE
VITE_PORTER_WEBHOOK_SECRET=your_webhook_hmac_secret
VITE_PORTER_TRACKING_BASE_URL=https://track.porterexpress.eg

# Optional warehouse overrides
VITE_PORTER_WAREHOUSE_NAME=...
VITE_PORTER_WAREHOUSE_PHONE=...
VITE_PORTER_WAREHOUSE_ADDRESS=...
VITE_PORTER_WAREHOUSE_CITY=...
VITE_PORTER_WAREHOUSE_GOVERNORATE=...
```

> Setting `VITE_PORTER_SANDBOX=false` (instead of `VITE_PORTER_PROD=true`) also switches out of sandbox mode, provided `VITE_PORTER_API_KEY` does not contain `SANDBOX`.

---

## 3D Pouch Texture Assets

`BaladiPouch3DViewer` loads bilingual front/back panel textures (`512x1024`) from `public/brand/3d/`:

- `cat-ar-front.png`, `cat-ar-back.png`
- `cat-en-front.png`, `cat-en-back.png`
- `dog-ar-front.png`, `dog-ar-back.png`
- `dog-en-front.png`, `dog-en-back.png`

Replacing any file above using the exact filename automatically updates the 3D showroom without code changes.

---

## Deployment

Configured for **Vercel** static SPA hosting (`vercel.json` rewrites `/(.*)` to `/index.html`, and `package.json` allows `esbuild` scripts during installation).
