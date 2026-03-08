import { useState } from 'react';
import { MapPin, Search, Loader2, ExternalLink, Globe2, Flag, ArrowUpDown, Navigation, ChevronDown, Camera } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translateText } from '../../services/translation';
import { StreetViewPanel } from './StreetViewPanel';

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

interface WayfinderPanelProps {
  onFlyTo: (lat: number, lng: number) => void;
  globeRef?: React.RefObject<any>;
}

export function WayfinderPanel({ onFlyTo, globeRef }: WayfinderPanelProps) {
  const { selectedCountry, targetLang } = useAppStore();

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
  const [directionsExpanded, setDirectionsExpanded] = useState(false);

  const [streetView, setStreetView] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const locationBias = selectedCountry?.name ?? '';
      const searchQuery = locationBias ? `${query} in ${locationBias}` : query;
      const res = await fetch(
        `/api/places/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
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
      const msg = e.message ?? 'Search failed';
      setError(msg.includes('not configured') ? 'Add VITE_GOOGLE_PLACES_KEY to Replit Secrets to use Wayfinder.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDestination = (place: Place) => {
    setDestination(place.name);
    setDirectionsExpanded(true);
  };

  const handleGetDirections = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setDirLoading(true);
    setDirError(null);
    setDirections(null);
    try {
      const res = await fetch(
        `/api/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${travelMode}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
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

      try {
        const [originRes, destRes] = await Promise.all([
          fetch(`/api/places/search?query=${encodeURIComponent(origin)}`).then(r => r.json()),
          fetch(`/api/places/search?query=${encodeURIComponent(destination)}`).then(r => r.json()),
        ]);
        const oLat = originRes.results?.[0]?.geometry?.location?.lat;
        const oLng = originRes.results?.[0]?.geometry?.location?.lng;
        const dLat = destRes.results?.[0]?.geometry?.location?.lat;
        const dLng = destRes.results?.[0]?.geometry?.location?.lng;
        if (oLat != null && oLng != null && dLat != null && dLng != null && globeRef?.current) {
          globeRef.current.clearMarkers();
          globeRef.current.addMarker(oLat, oLng, origin, '#00FFFF');
          globeRef.current.addMarker(dLat, dLng, destination, '#FFD700');
          globeRef.current.setRoute(oLat, oLng, dLat, dLng);
        }
      } catch {}
    } catch (e: any) {
      const msg = e.message ?? 'Failed to get directions';
      setDirError(msg.includes('not configured') ? 'Add VITE_GOOGLE_PLACES_KEY to Replit Secrets to use Wayfinder.' : msg);
    } finally {
      setDirLoading(false);
    }
  };

  const handleSwapDirections = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleClearDirections = () => {
    setDirections(null);
    setDirError(null);
    setOrigin('');
    setDestination('');
    setDirectionsExpanded(false);
    globeRef?.current?.clearMarkers();
    globeRef?.current?.clearRoute();
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Wayfinder</h3>
      </div>

      <p className="text-xs text-muted-foreground/50 mb-3">
        Search places, addresses and landmarks. Results translated to {targetLang.toUpperCase()}.
      </p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={selectedCountry ? `Search in ${selectedCountry.name}...` : 'Search places, landmarks, addresses...'}
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
        id="wayfinder-places-section"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
          <p className="text-red-400 text-xs" data-testid="text-wayfinder-error">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar mb-3">
        {places.map((p, i) => (
          <div key={i}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group"
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
                  <span className="text-[10px] text-yellow-400 font-bold">{'\u2605'} {p.rating}</span>
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
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed mb-2">{p.addressTranslated}</p>

            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  if (globeRef?.current?.setMarkerAndFly) {
                    globeRef.current.setMarkerAndFly(p.lat, p.lng, p.name);
                  } else {
                    onFlyTo(p.lat, p.lng);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider transition-all"
                data-testid={`button-fly-to-${i}`}
              >
                <Globe2 className="w-3 h-3" />
                Fly Here
              </button>
              <button
                onClick={() => handleSetDestination(p)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider transition-all"
                data-testid={`button-directions-to-${i}`}
              >
                <Navigation className="w-3 h-3" />
                Directions
              </button>
              <button
                onClick={() => setStreetView({ lat: p.lat, lng: p.lng, name: p.name })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider transition-all"
                data-testid={`button-street-view-${i}`}
              >
                <Camera className="w-3 h-3" />
                Street View
              </button>
            </div>
          </div>
        ))}
        {places.length === 0 && !loading && !error && (
          <div className="flex-1 flex items-center justify-center text-center py-8">
            <p className="text-muted-foreground/30 text-xs" data-testid="text-wayfinder-empty">Search for hospitals, restaurants,<br/>hotels, landmarks and more</p>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-3">
        <button
          onClick={() => setDirectionsExpanded(prev => !prev)}
          className="w-full flex items-center justify-between mb-3"
          data-testid="button-toggle-directions"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Get Directions</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${directionsExpanded ? 'rotate-180' : ''}`} />
        </button>

        {directionsExpanded && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
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

            <div className="flex gap-1">
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

            <div className="flex gap-2">
              <button
                onClick={handleGetDirections}
                disabled={dirLoading || !origin.trim() || !destination.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary/80 to-cyan-400/80
                           text-black text-sm font-bold uppercase tracking-wider
                           hover:from-primary hover:to-cyan-400 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                data-testid="button-get-directions"
              >
                {dirLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                {dirLoading ? 'Getting Route...' : 'Get Directions'}
              </button>
              {directions && (
                <button
                  onClick={handleClearDirections}
                  className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                  data-testid="button-clear-directions"
                >
                  Clear
                </button>
              )}
            </div>

            {dirError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs" data-testid="text-directions-error">{dirError}</p>
              </div>
            )}

            {directions && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground/60">Total Distance</p>
                    <p className="text-sm font-bold text-primary" data-testid="text-directions-distance">{directions.totalDistance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground/60">Duration</p>
                    <p className="text-sm font-bold text-primary" data-testid="text-directions-duration">{directions.totalDuration}</p>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 hide-scrollbar">
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
              <div className="text-center py-4">
                <p className="text-muted-foreground/30 text-xs" data-testid="text-directions-empty">Enter an origin and destination<br/>to get translated directions</p>
              </div>
            )}
          </div>
        )}
      </div>

      {streetView && (
        <StreetViewPanel
          lat={streetView.lat}
          lng={streetView.lng}
          placeName={streetView.name}
          onClose={() => setStreetView(null)}
        />
      )}
    </div>
  );
}
