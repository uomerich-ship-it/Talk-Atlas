# TalkAtlas

## Overview

TalkAtlas is an interactive 3D globe-based translation application. Users can explore countries on a rotating globe, select them to view language information, and translate text between languages. The app features a neon/space/glassmorphism visual theme with Aqua, Yellow, and Burgundy accents against a cinematic deep-space universe background. Designed for web + native iOS/Android via Capacitor.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Styling**: Tailwind CSS with CSS variables for theming, glassmorphism effects
- **UI Components**: shadcn/ui component library (Radix primitives + Tailwind)
- **State Management**: Zustand with localStorage persistence for pinned/recent countries
- **Data Fetching**: TanStack React Query for server state management
- **3D Globe**: react-globe.gl library with Three.js for interactive globe visualization
- **Universe Background**: Custom Three.js scene with 8000+ stars, 4 nebulae, gas giant (Jupiter-like with rings/red spot), ice giant (Neptune-like with atmospheric glow), Milky Way core, distant galaxy
- **Animations**: Framer Motion for UI transitions
- **Speech-to-Text**: Web Speech API via useSpeechToText hook (with Capacitor native mic permissions)
- **Text-to-Speech**: SpeechSynthesis API for reading translations aloud
- **Mobile**: Capacitor for native iOS/Android builds with safe area support

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with tsx in development, esbuild for production)
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod schema validation
- **AI Integration**: OpenAI API via Replit AI Integrations for translation services

### Translation Pipeline
- **Primary**: DeepL API (via /api/deepl-translate server proxy, env: DEEPL_API_KEY)
- **Secondary**: OpenAI GPT via server-side /api/translate endpoint (Replit AI Integrations)
- **Fallback**: MyMemory free translation API (no key required)
- **Service**: client/src/services/translation.ts handles cascading fallback logic

### Payments
- **Web**: Stripe (@stripe/stripe-js) for web checkout (VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_PREMIUM_PRICE_ID)
- **Mobile**: RevenueCat (@revenuecat/purchases-capacitor) for iOS/Android in-app purchases (VITE_RC_API_KEY_IOS, VITE_RC_API_KEY_ANDROID)
- **Billing Service**: client/src/services/billing/index.ts — guards with Capacitor.isNativePlatform()
- **Graceful degradation**: Shows toast message if Stripe keys not configured on web; shows friendly message for non-native RevenueCat

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (settings and translations tables)
- **Migrations**: Drizzle Kit with migrations stored in /migrations folder
- **Static Data**: Local JSON files for country-to-language mappings (offline-ready)

### UI Layout
- **Left**: CountryListPanel sidebar with country list, settings, and premium buttons
- **Center**: Full-screen 3D globe (GlobeView + UniverseBackground)
- **Right**: Collapsible translation drawer panel (slides in/out with glowing tab button)

### Project Structure
```
client/           # React frontend
  src/
    components/
      globe/        # GlobeView, UniverseBackground (Three.js starfield)
      translation/  # TranslationPanel (right-side drawer)
      countries/    # CountryListPanel with pin/recent/premium
      ui/           # shadcn/ui components, SettingsPanel
    data/           # Static JSON mappings (countryLanguages, languages)
    hooks/          # Custom React hooks (useSpeechToText with Capacitor mic, etc.)
    services/       # Translation service, Stripe checkout, billing (RevenueCat)
    store/          # Zustand state management (useAppStore)
    pages/          # Page components (Home)
server/             # Express backend
  routes.ts         # API endpoint definitions
  storage.ts        # Database operations
  replit_integrations/  # AI service integrations (chat, image, batch)
shared/             # Shared code between client/server
  schema.ts         # Drizzle database schemas
  routes.ts         # API route definitions with Zod validation
capacitor.config.ts # Capacitor native app configuration
public/
  app-store-metadata.json  # App store listing metadata
```

### Build System
- Development: Vite dev server with HMR, tsx for server
- Production: Vite builds frontend to dist/public, esbuild bundles server to dist/index.cjs
- Mobile: `npm run build:mobile` (vite build + cap sync), `npm run open:ios`, `npm run open:android`
- Type checking: TypeScript with strict mode, path aliases (@/, @shared/)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### AI Services
- **OpenAI API**: Translation functionality using GPT models
- **Environment Variables**: AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL (Replit AI Integrations)

### Translation APIs
- **DeepL API** (optional): DEEPL_API_KEY env var (server-side only, proxied via /api/deepl-translate)
- **MyMemory API** (free fallback): No key required

### Payments
- **Stripe** (optional, web): VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_PREMIUM_PRICE_ID env vars
- **RevenueCat** (optional, mobile): VITE_RC_API_KEY_IOS, VITE_RC_API_KEY_ANDROID env vars

### Native Mobile
- **Capacitor**: @capacitor/core, @capacitor/cli, @capacitor/ios, @capacitor/android
- **Plugins**: @capacitor/haptics, @capacitor/status-bar, @capacitor/splash-screen
- **RevenueCat**: @revenuecat/purchases-capacitor

### External Data Sources
- **Globe Data**: GeoJSON from GitHub (ne_110m_admin_0_countries)
- **Globe Textures**: Three.js globe textures from unpkg.com (earth-blue-marble, earth-topology, night-sky)

### Key NPM Packages
- react-globe.gl + three: 3D globe visualization
- @stripe/stripe-js: Stripe checkout integration
- @capacitor/core + related: Native mobile builds
- @revenuecat/purchases-capacitor: In-app purchases
- @tanstack/react-query: Server state management
- zustand: Client state management
- framer-motion: Animations
- drizzle-orm + drizzle-zod: Database ORM with Zod integration
- express + express-session: HTTP server and sessions
- openai: AI translation API client

### Environment Variables (.env.example)
- VITE_DEEPL_API_KEY: DeepL translation API key (optional)
- VITE_STRIPE_PUBLISHABLE_KEY: Stripe publishable key (optional)
- VITE_STRIPE_PREMIUM_PRICE_ID: Stripe price ID for premium plan (optional)
- VITE_RC_API_KEY_IOS: RevenueCat iOS API key (optional, for native app)
- VITE_RC_API_KEY_ANDROID: RevenueCat Android API key (optional, for native app)

## Critical Rules (Do NOT Change)
- Do NOT change src/store/useAppStore.ts
- Do NOT change src/services/translation.ts
- Do NOT change src/data/ folder
- Do NOT change GlobeView.tsx
- Keep ALL existing data-testid attributes
- Keep all existing CSS classes: glass-panel, neon-text, neon-border
- Guard Capacitor/RevenueCat imports with isNativePlatform() checks
