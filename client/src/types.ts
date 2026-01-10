export type CountryEntry = {
  name: string;
  iso3?: string;
  languages: string[];
  languageCount: number;
};

export interface AppState {
  countries: CountryEntry[];
  selectedCountry: CountryEntry | null;
  targetLang: string;
  setCountries: (countries: CountryEntry[]) => void;
  setSelectedCountry: (country: CountryEntry | null) => void;
  setTargetLang: (lang: string) => void;
}
