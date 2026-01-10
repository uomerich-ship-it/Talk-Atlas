import countryLanguages from './countryLanguages.json';
import countryNameMap from './countryNameToISO3.json';
import { CountryEntry } from '../types';

export function getCountries(features: any[]): CountryEntry[] {
  return features.map(feature => {
    const name = feature.properties.ADMIN || feature.properties.name;
    const iso3 = feature.properties.ISO_A3 || (countryNameMap as any)[name];
    const languages = (countryLanguages as any)[iso3] || [];
    
    return {
      name,
      iso3,
      languages: languages.map((l: string) => l.slice(0, 2).toLowerCase()),
      languageCount: languages.length
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
