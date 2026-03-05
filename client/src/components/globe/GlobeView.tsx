import { useEffect, useRef, useState, useMemo } from 'react';
import GlobeTGL from 'react-globe.gl';
import { useAppStore } from '../../store/useAppStore';
import { getCountries } from '../../data/countries';
import { UniverseBackground } from './UniverseBackground';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function GlobeView() {
  const globeEl = useRef<any>(null);
  const { setCountries, selectedCountry, setSelectedCountry } = useAppStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const webglAvailable = useMemo(() => isWebGLAvailable(), []);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setCountries(getCountries(data.features));
      });
  }, [setCountries]);

  useEffect(() => {
    if (selectedCountry && globeEl.current && geoData) {
      const feature = geoData.features.find((f: any) => 
        (f.properties.ADMIN || f.properties.name) === selectedCountry.name
      );
      if (feature) {
        const lat = feature.properties.label_lat ?? 0;
        const lng = feature.properties.label_lng ?? 0;
        globeEl.current.pointOfView({ lat, lng, altitude: 1.8 }, 1500);
      }
    }
  }, [selectedCountry, geoData]);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
    }
  }, []);

  if (!webglAvailable) {
    return (
      <div className="flex-1 relative flex items-center justify-center" data-testid="globe-container" style={{ background: 'radial-gradient(ellipse at 50% 50%, #060818 0%, #010208 60%, #000104 100%)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <p className="text-muted-foreground text-sm">3D Globe requires WebGL support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative" data-testid="globe-container">
      <UniverseBackground />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <GlobeTGL
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl=""
          
          polygonsData={geoData?.features || []}
          polygonSideColor={() => 'rgba(0, 255, 255, 0.02)'}
          polygonCapColor={d => 
            (d as any).properties.ADMIN === selectedCountry?.name ? 'rgba(0, 255, 255, 0.35)' :
            (d as any).properties.ADMIN === hoveredCountry ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.03)'
          }
          polygonStrokeColor={() => '#00FFFF'}
          polygonAltitude={d => (d as any).properties.ADMIN === hoveredCountry ? 0.015 : 0.005}
          
          onPolygonHover={d => setHoveredCountry(d ? (d as any).properties.ADMIN : null)}
          onPolygonClick={d => {
            const name = (d as any).properties.ADMIN || (d as any).properties.name;
            const { countries } = useAppStore.getState();
            const country = countries.find(c => c.name === name);
            if (country) setSelectedCountry(country);
          }}
          
          atmosphereColor="rgba(0, 180, 255, 1)"
          atmosphereAltitude={0.18}
          rendererConfig={{ antialias: true, alpha: true }}
          
          labelsData={hoveredCountry ? [{ name: hoveredCountry }] : []}
          labelText={() => hoveredCountry || ''}
          labelSize={1.2}
          labelDotRadius={0.4}
          labelColor={() => '#00FFFF'}
          labelResolution={3}
        />
      </div>

      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'linear-gradient(to bottom, rgba(2,2,2,0.7), transparent)',
        }}
      />
    </div>
  );
}
