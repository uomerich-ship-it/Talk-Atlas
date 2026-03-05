# TalkAtlas

## Overview

TalkAtlas is an interactive 3D globe-based translation application. Users can explore countries on a rotating globe, select them to view language information, and translate text between languages. The app features a neon/space/glassmorphism visual theme with Aqua, Yellow, and Burgundy accents against a cinematic deep-space universe background.

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
- **Universe Background**: Custom Three.js scene with 8000+ stars, nebulae, gas/ice giant planets, and Milky Way core
- **Animations**: Framer Motion for UI transitions
- **Speech-to-Text**: Web Speech API via useSpeechToText hook
- **Text-to-Speech**: SpeechSynthesis API for reading translations aloud

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with tsx in development, esbuild for production)
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod schema validation
- **AI Integration**: OpenAI API via Replit AI Integrations for translation services

### Translation Pipeline
- **Primary**: DeepL API (if VITE_DEEPL_API_KEY is configured)
- **Secondary**: OpenAI GPT via server-side /api/translate endpoint (Replit AI Integrations)
- **Fallback**: MyMemory free translation API (no key required)
- **Service**: client/src/services/translation.ts handles cascading fallback logic

### Payments
- **Stripe**: @stripe/stripe-js for client-side checkout (requires VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_PREMIUM_PRICE_ID)
- **Service**: client/src/services/stripe.ts with server-side route comments
- **Graceful degradation**: Shows toast message if Stripe keys not configured

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (settings and translations tables)
- **Migrations**: Drizzle Kit with migrations stored in /migrations folder
- **Static Data**: Local JSON files for country-to-language mappings (offline-ready)

### Project Structure
```
client/           # React frontend
  src/
    components/
      globe/        # GlobeView, UniverseBackground (Three.js starfield)
      translation/  # TranslationPanel with speech/DeepL/fallback
      countries/    # CountryListPanel with pin/recent/premium
      ui/           # shadcn/ui components, SettingsPanel
    data/           # Static JSON mappings (countryLanguages, languages)
    hooks/          # Custom React hooks (useSpeechToText, use-translations, etc.)
    services/       # Translation service, Stripe checkout service, billing
    store/          # Zustand state management (useAppStore)
    pages/          # Page components (Home)
server/             # Express backend
  routes.ts         # API endpoint definitions
  storage.ts        # Database operations
  replit_integrations/  # AI service integrations (chat, image, batch)
shared/             # Shared code between client/server
  schema.ts         # Drizzle database schemas
  routes.ts         # API route definitions with Zod validation
```

### Build System
- Development: Vite dev server with HMR, tsx for server
- Production: Vite builds frontend to dist/public, esbuild bundles server to dist/index.cjs
- Type checking: TypeScript with strict mode, path aliases (@/, @shared/)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### AI Services
- **OpenAI API**: Translation functionality using GPT models
- **Environment Variables**: AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL (Replit AI Integrations)

### Translation APIs
- **DeepL API** (optional): VITE_DEEPL_API_KEY env var
- **MyMemory API** (free fallback): No key required

### Payments
- **Stripe** (optional): VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_PREMIUM_PRICE_ID env vars

### External Data Sources
- **Globe Data**: GeoJSON from GitHub (ne_110m_admin_0_countries)
- **Globe Textures**: Three.js globe textures from unpkg.com (earth-blue-marble, earth-topology, night-sky)

### Key NPM Packages
- react-globe.gl + three: 3D globe visualization
- @stripe/stripe-js: Stripe checkout integration
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
