# TalkAtlas

## Overview

TalkAtlas is an interactive 3D globe-based translation application. Users can explore countries on a rotating globe, select them to view language information, and translate text between languages. The app features a neon/space/glassmorphism visual theme with Aqua, Yellow, and Burgundy accents against a dark starfield background.

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
- **Animations**: Framer Motion for UI transitions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with tsx in development, esbuild for production)
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod schema validation
- **AI Integration**: OpenAI API via Replit AI Integrations for translation services

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (settings and translations tables)
- **Migrations**: Drizzle Kit with migrations stored in /migrations folder
- **Static Data**: Local JSON files for country-to-language mappings (offline-ready)

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (globe, translation, countries panels)
    data/         # Static JSON mappings (countryLanguages, languages)
    hooks/        # Custom React hooks
    store/        # Zustand state management
    pages/        # Page components
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database operations
  replit_integrations/  # AI service integrations (chat, image, batch)
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schemas
  routes.ts       # API route definitions with Zod validation
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

### External Data Sources
- **Globe Data**: GeoJSON from unpkg.com (ne_110m_admin_0_countries)
- **Globe Textures**: Three.js globe textures from unpkg.com

### Key NPM Packages
- react-globe.gl + three: 3D globe visualization
- @tanstack/react-query: Server state management
- zustand: Client state management
- framer-motion: Animations
- drizzle-orm + drizzle-zod: Database ORM with Zod integration
- express + express-session: HTTP server and sessions
- openai: AI translation API client