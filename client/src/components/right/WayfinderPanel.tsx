import { useState } from 'react';
import { MapPin, Search, Loader2, ExternalLink, Globe2, Flag, ArrowUpDown, Navigation } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translateText } from '../../services/translation';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string;

interface Place {
  name: string;
  nameTranslated: string;
  address: string;
  addressTranslated: string;
  rating?: number;
  types: string[];
  lat: number;
  lng: number;
  placeId: string;
}

type TravelMode = 'driving' | 'walking' | 'transit' | 'bicycling';
type WayfinderTab = 'places' | 'directions';

interface DirectionStep {
  instructionOriginal: string;
  instructionTranslated: string;
  distance: string;
}

interface DirectionsResult {
  totalDistance: string;
  totalDuration: string;
  steps: DirectionStep[];
}

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const TRAVEL_MODES: { mode: TravelMode; icon: string; label: string }[] = [
  { mode: 'driving', icon: '\u{1F697}', label: 'Drive' },
  { mode: 'walking', icon: '\u{1F6B6}', label: 'Walk' },
  { mode: 'transit', icon: '\u{1F68C}', label: 'Transit' },
  { mode: 'bicycling', icon: '\u{1F6B2}', label: 'Bike' },
];

export function WayfinderPanel({ onFlyTo }: { onFlyTo: (lat: number, lng: number) => void }) {
  const { selectedCountry, targetLang } = useAppStore();
  const [activeTab, setActiveTab] = useState<WayfinderTab>('places');

  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState<string | null>(null);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!GOOGLE_KEY) {
      setError('Google Places API key not configured. Add VITE_GOOGLE_PLACES_KEY to Replit Secrets.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const locationBias = selectedCountry?.name ?? '';
      const searchQuery = locationBias ? `${query} in ${locationBias}` : query;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}`
      );
      const data = await res.json();
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') throw new Error(data.error_message ?? data.status);

      const results: Place[] = await Promise.all(
        (data.results ?? []).slice(0, 6).map(async (p: any) => {
          let nameTranslated = p.name;
          let addressTranslated = p.formatted_address ?? '';
          if (targetLang !== 'en') {
            try {
              const [nt, at] = await Promise.all([
                translateText(p.name, 'en', targetLang),
                translateText(p.formatted_address ?? '', 'en', targetLang),
              ]);
              nameTranslated = nt.translated;
              addressTranslated = at.translated;
            } catch {}
          }
          return {
            name: p.name,
            nameTranslated,
            address: p.formatted_address ?? '',
            addressTranslated,
            rating: p.rating,
            types: p.types?.slice(0, 2) ?? [],
            lat: p.geometry?.location?.lat ?? 0,
            lng: p.geometry?.location?.lng ?? 0,
            placeId: p.place_id,
          };
        })
      );
      setPlaces(results);
    } catch (e: any) {
      setError(e.message ?? 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = async () => {
    if (!origin.trim() || !destination.trim()) return;
    if (!GOOGLE_KEY) {
      setDirError('Add VITE_GOOGLE_PLACES_KEY to Replit Secrets to use Wayfinder.');
      return;
    }
    setDirLoading(true);
    setDirError(null);
    setDirections(null);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${travelMode}&key=${GOOGLE_KEY}`
      );
      const data = await res.json();
      if (data.status !== 'OK') throw new Error(data.error_message ?? data.status ?? 'No route found');

      const leg = data.routes[0].legs[0];
      const totalDistance = leg.distance.text;
      const totalDuration = leg.duration.text;

      const steps: DirectionStep[] = await Promise.all(
        (leg.steps ?? []).map(async (step: any) => {
          const original = stripHtml(step.html_instructions ?? '');
          let translated = original;
          if (targetLang !== 'en') {
            try {
              const result = await translateText(original, 'en', targetLang);
              translated = result.translated;
            } catch {}
          }
          return {
            instructionOriginal: original,
            instructionTranslated: translated,
            distance: step.distance?.text ?? '',
          };
        })
      );

      setDirections({ totalDistance, totalDuration, steps });
    } catch (e: any) {
      setDirError(e.message ?? 'Failed to get directions');
    } finally {
      setDirLoading(false);
    }
  };

  const handleSwapDirections = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Wayfinder</h3>
      </div>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab('places')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'places'
              ? 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/5 text-muted-foreground border border-white/5 hover:text-primary'
          }`}
          data-testid="button-wayfinder-tab-places"
        >
          Find Places
        </button>
        <button
          onClick={() => setActiveTab('directions')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'directions'
              ? 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/5 text-muted-foreground border border-white/5 hover:text-primary'
          }`}
          data-testid="button-wayfinder-tab-directions"
        >
          Directions
        </button>
      </div>

      {activeTab === 'places' && (
        <>
          <p className="text-xs text-muted-foreground/50 mb-3">
            Search places, addresses and landmarks. Results translated to {targetLang.toUpperCase()}.
          </p>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={selectedCountry ? `Search in ${selectedCountry.name}...` : 'Search any place...'}
              className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl
                         pl-9 pr-3 py-2.5 text-sm outline-none transition-all"
              data-testid="input-wayfinder-search"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-full py-2.5 mb-3 rounded-xl bg-gradient-to-r from-primary/80 to-cyan-400/80
                       text-black text-sm font-bold uppercase tracking-wider
                       hover:from-primary hover:to-cyan-400 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            data-testid="button-find-places"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Find Places'}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
              <p className="text-red-400 text-xs" data-testid="text-wayfinder-error">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
            {places.map((p, i) => (
              <div key={i}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => onFlyTo(p.lat, p.lng)}
                data-testid={`card-place-${i}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{p.nameTranslated}</p>
                    {p.nameTranslated !== p.name && (
                      <p className="text-[10px] text-muted-foreground/40 truncate">{p.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.rating && (
                      <span className="text-[10px] text-yellow-400 font-bold">★ {p.rating}</span>
                    )}
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${p.placeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-muted-foreground/40 hover:text-primary transition-colors"
                      data-testid={`link-place-map-${i}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{p.addressTranslated}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Globe2 className="w-2.5 h-2.5 text-primary/40" />
                  <span className="text-[9px] text-primary/40 uppercase tracking-wider">Tap to fly to location</span>
                </div>
              </div>
            ))}
            {places.length === 0 && !loading && !error && (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <p className="text-muted-foreground/30 text-xs" data-testid="text-wayfinder-empty">Search for hospitals, restaurants,<br/>hotels, landmarks and more</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'directions' && (
        <>
          <p className="text-xs text-muted-foreground/50 mb-3">
            Get directions between two places. Steps translated to {targetLang.toUpperCase()}.
          </p>

          <div className="flex flex-col gap-2 mb-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="Starting point..."
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl
                           pl-9 pr-3 py-2.5 text-sm outline-none transition-all"
                data-testid="input-directions-origin"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwapDirections}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                title="Swap origin and destination"
                data-testid="button-swap-directions"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Destination..."
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl
                           pl-9 pr-3 py-2.5 text-sm outline-none transition-all"
                data-testid="input-directions-destination"
              />
            </div>
          </div>

          <div className="flex gap-1 mb-3">
            {TRAVEL_MODES.map(tm => (
              <button
                key={tm.mode}
                onClick={() => setTravelMode(tm.mode)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  travelMode === tm.mode
                    ? 'bg-primary/20 border border-primary/40 text-primary'
                    : 'bg-white/5 border border-white/5 text-muted-foreground hover:text-primary'
                }`}
                data-testid={`button-mode-${tm.mode}`}
              >
                <span className="text-base">{tm.icon}</span>
                <span>{tm.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleGetDirections}
            disabled={dirLoading || !origin.trim() || !destination.trim()}
            className="w-full py-2.5 mb-3 rounded-xl bg-gradient-to-r from-primary/80 to-cyan-400/80
                       text-black text-sm font-bold uppercase tracking-wider
                       hover:from-primary hover:to-cyan-400 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            data-testid="button-get-directions"
          >
            {dirLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {dirLoading ? 'Getting Route...' : 'Get Directions'}
          </button>

          {dirError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
              <p className="text-red-400 text-xs" data-testid="text-directions-error">{dirError}</p>
            </div>
          )}

          {directions && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 rounded-xl bg-white/5 border border-primary/20 mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/60">Total Distance</p>
                  <p className="text-sm font-bold text-primary" data-testid="text-directions-distance">{directions.totalDistance}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground/60">Duration</p>
                  <p className="text-sm font-bold text-primary" data-testid="text-directions-duration">{directions.totalDuration}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
                {directions.steps.map((step, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5" data-testid={`card-direction-step-${i}`}>
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white leading-relaxed">{step.instructionTranslated}</p>
                        {step.instructionTranslated !== step.instructionOriginal && (
                          <p className="text-xs text-muted-foreground/40 mt-0.5">{step.instructionOriginal}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-primary/60 font-medium mt-0.5">{step.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!directions && !dirLoading && !dirError && (
            <div className="flex-1 flex items-center justify-center text-center py-8">
              <p className="text-muted-foreground/30 text-xs" data-testid="text-directions-empty">Enter an origin and destination<br/>to get translated directions</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
