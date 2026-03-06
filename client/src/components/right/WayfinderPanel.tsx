import { useState } from 'react';
import { MapPin, Search, Loader2, ExternalLink, Globe2 } from 'lucide-react';
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

export function WayfinderPanel({ onFlyTo }: { onFlyTo: (lat: number, lng: number) => void }) {
  const { selectedCountry, targetLang } = useAppStore();
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    </div>
  );
}
