import { useEffect, useRef, useState } from 'react';
import GlobeTGL from 'react-globe.gl';
import { useAppStore } from '../../store/useAppStore';
import { getCountries } from '../../data/countries';

export function GlobeView() {
  const globeEl = useRef<any>(null);
  const { setCountries, selectedCountry, setSelectedCountry } = useAppStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

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

  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03)_0%,transparent_100%)] pointer-events-none z-10" />
      <GlobeTGL
        ref={globeEl}
        // Higher resolution textures
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
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
        
        atmosphereColor="#00FFFF"
        atmosphereAltitude={0.12}
        
        labelsData={hoveredCountry ? [{ name: hoveredCountry }] : []}
        labelText={() => hoveredCountry || ''}
        labelSize={1.2}
        labelDotRadius={0.4}
        labelColor={() => '#00FFFF'}
        labelResolution={3}
      />
    </div>
  );
}
