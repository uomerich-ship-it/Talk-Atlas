import { X, Camera } from 'lucide-react';

interface StreetViewPanelProps {
  lat: number;
  lng: number;
  placeName: string;
  onClose: () => void;
}

export function StreetViewPanel({
  lat,
  lng,
  placeName,
  onClose,
}: StreetViewPanelProps) {
  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string;
  const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_KEY}&location=${lat},${lng}&heading=0&pitch=0&fov=90`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="panel-street-view">
      <div className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden border border-primary/30 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Street View
            </span>
            <span className="text-xs text-muted-foreground/60 ml-1">
              — {placeName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            data-testid="button-close-street-view"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={streetViewUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={`Street View — ${placeName}`}
          />
        </div>

        <div className="px-4 py-2 bg-black/90 border-t border-white/10">
          <p className="text-[10px] text-muted-foreground/40">
            Drag to look around · Scroll to zoom · Click arrows to move
          </p>
        </div>
      </div>
    </div>
  );
}
