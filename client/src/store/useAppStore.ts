import { create } from 'zustand';
import { AppState, CountryEntry } from '../types';

export const useAppStore = create<AppState>((set) => ({
  countries: [],
  selectedCountry: null,
  targetLang: 'es',
  setCountries: (countries) => set({ countries }),
  setSelectedCountry: (country) => {
    set({ selectedCountry: country });
    if (country && country.languages.length === 1) {
      set({ targetLang: country.languages[0] });
    }
  },
  setTargetLang: (lang) => set({ targetLang: lang }),
}));
