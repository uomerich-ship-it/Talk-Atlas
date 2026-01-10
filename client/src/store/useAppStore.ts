import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, CountryEntry } from '../types';

interface ExtendedAppState extends AppState {
  pinnedCountries: string[]; // ISO3 or Name
  recentCountries: string[]; // ISO3 or Name
  isPremium: boolean;
  togglePin: (countryId: string) => void;
  addRecent: (countryId: string) => void;
  setPremium: (isPremium: boolean) => void;
}

export const useAppStore = create<ExtendedAppState>()(
  persist(
    (set, get) => ({
      countries: [],
      selectedCountry: null,
      targetLang: 'es',
      pinnedCountries: [],
      recentCountries: [],
      isPremium: false,

      setCountries: (countries) => set({ countries }),
      
      setSelectedCountry: (country) => {
        set({ selectedCountry: country });
        if (country) {
          get().addRecent(country.iso3 || country.name);
          if (country.languages.length === 1) {
            set({ targetLang: country.languages[0] });
          }
        }
      },

      setTargetLang: (lang) => set({ targetLang: lang }),

      togglePin: (countryId) => {
        const { pinnedCountries } = get();
        if (pinnedCountries.includes(countryId)) {
          set({ pinnedCountries: pinnedCountries.filter(id => id !== countryId) });
        } else {
          set({ pinnedCountries: [...pinnedCountries, countryId] });
        }
      },

      addRecent: (countryId) => {
        const { recentCountries } = get();
        const filtered = recentCountries.filter(id => id !== countryId);
        set({ recentCountries: [countryId, ...filtered].slice(0, 5) });
      },

      setPremium: (isPremium) => set({ isPremium }),
    }),
    {
      name: 'talk-atlas-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        pinnedCountries: state.pinnedCountries,
        recentCountries: state.recentCountries,
        targetLang: state.targetLang,
        isPremium: state.isPremium,
      }),
    }
  )
);
