import { useEffect, useRef, useState, useMemo } from 'react';
import GlobeTGL from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Cloud, Languages } from 'lucide-react';
import { useResizeObserver } from '@/hooks/use-resize-observer'; // Using a custom hook or creating a simple one inside

// Simple mock data for countries
const MOCK_COUNTRY_DATA: Record<string, { time: string; weather: string; languages: string[] }> = {
  "United States": { time: "4:20 PM EST", weather: "22°C Sunny", languages: ["English", "Spanish"] },
  "China": { time: "4:20 AM CST", weather: "18°C Cloudy", languages: ["Mandarin", "Cantonese"] },
  "India": { time: "1:50 AM IST", weather: "28°C Haze", languages: ["Hindi", "English", "Bengali"] },
  "Brazil": { time: "5:20 PM BRT", weather: "26°C Rainy", languages: ["Portuguese"] },
  "Russia": { time: "11:20 PM MSK", weather: "-5°C Snow", languages: ["Russian"] },
  "Japan": { time: "5:20 AM JST", weather: "15°C Clear", languages: ["Japanese"] },
  "Germany": { time: "10:20 PM CET", weather: "10°C Rain", languages: ["German"] },
  "France": { time: "10:20 PM CET", weather: "12°C Cloudy", languages: ["French"] },
  "United Kingdom": { time: "9:20 PM GMT", weather: "8°C Drizzle", languages: ["English"] },
  "Italy": { time: "10:20 PM CET", weather: "14°C Clear", languages: ["Italian"] },
  "Canada": { time: "4:20 PM EST", weather: "2°C Cloudy", languages: ["English", "French"] },
  "Australia": { time: "8:20 AM AEST", weather: "24°C Sunny", languages: ["English"] },
  "Mexico": { time: "3:20 PM CST", weather: "25°C Sunny", languages: ["Spanish"] },
  "Spain": { time: "10:20 PM CET", weather: "18°C Clear", languages: ["Spanish", "Catalan"] },
  "South Korea": { time: "5:20 AM KST", weather: "12°C Clear", languages: ["Korean"] },
  "Turkey": { time: "11:20 PM TRT", weather: "14°C Cloudy", languages: ["Turkish"] },
  "Vietnam": { time: "3:20 AM ICT", weather: "26°C Rainy", languages: ["Vietnamese"] },
  "Egypt": { time: "11:20 PM EET", weather: "20°C Clear", languages: ["Arabic"] },
  "South Africa": { time: "11:20 PM SAST", weather: "22°C Clear", languages: ["English", "Afrikaans", "Zulu"] },
  "Argentina": { time: "6:20 PM ART", weather: "20°C Clear", languages: ["Spanish"] },
};

function getCountryInfo(name: string) {
  return MOCK_COUNTRY_DATA[name] || { 
    time: "Local Time", 
    weather: "--°C", 
    languages: ["Unknown"] 
  };
}

export function GlobeVisualization() {
  const globeEl = useRef<any>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
    }
  }, []);

  const handleCountryClick = (polygon: any) => {
    if (!polygon) return;
    
    // Stop rotation when interacting
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      const { lat, lng } = polygon.properties.label_lat ? 
        { lat: polygon.properties.label_lat, lng: polygon.properties.label_lng } : // Some datasets have center props
        { lat: 0, lng: 0 }; // Fallback to calculation if needed, but for now we just show modal
      
      // Ideally we'd tween camera to look at the country here
      globeEl.current.pointOfView({ lat: polygon.bbox ? (polygon.bbox[1] + polygon.bbox[3])/2 : 0, lng: polygon.bbox ? (polygon.bbox[0] + polygon.bbox[2])/2 : 0, altitude: 2 }, 1000);
    }
    
    setSelectedCountry({
      name: polygon.properties.ADMIN,
      ...getCountryInfo(polygon.properties.ADMIN)
    });
  };

  const handleCloseModal = () => {
    setSelectedCountry(null);
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 60%, #020818 0%, #000308 100%)' }}>
      <GlobeTGL
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(0, 255, 255, 0.08)'}
        polygonSideColor={() => 'rgba(0, 255, 255, 0.15)'}
        polygonStrokeColor={() => '#00FFFF'}
        polygonLabel={({ properties }: any) => `
          <div class="px-2 py-1 bg-black/80 border border-primary/50 rounded text-xs text-primary font-mono">
            ${properties.ADMIN}
          </div>
        `}
        onPolygonClick={handleCountryClick}
        atmosphereColor="#00FFFF"
        atmosphereAltitude={0.25}
        rendererConfig={{ antialias: true, alpha: true }}
      />

      {/* Country Info Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4"
          >
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border-l-4 border-l-primary">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-1 neon-text">{selectedCountry.name}</h2>
              <div className="h-0.5 w-20 bg-primary mb-6 shadow-[0_0_10px_var(--primary)]"></div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Local Time</p>
                    <p className="text-xl font-medium">{selectedCountry.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Weather</p>
                    <p className="text-xl font-medium">{selectedCountry.weather}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-3 rounded-full bg-accent/40 text-rose-300">
                    <Languages className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Primary Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedCountry.languages.map((lang: string) => (
                        <span key={lang} className="text-sm px-2 py-0.5 rounded bg-white/10 border border-white/10">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
