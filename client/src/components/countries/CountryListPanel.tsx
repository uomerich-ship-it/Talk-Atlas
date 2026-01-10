import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function CountryListPanel() {
  const { countries, selectedCountry, setSelectedCountry, setTargetLang } = useAppStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'languages'>('name');

  const filteredCountries = useMemo(() => {
    return countries
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.languageCount - a.languageCount;
      });
  }, [countries, search, sortBy]);

  return (
    <div className="w-80 h-full glass-panel flex flex-col p-4 border-r border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold neon-text">Countries</h2>
      </div>

      <div className="space-y-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search countries..." 
            className="pl-9 bg-white/5 border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex-1 ${sortBy === 'name' ? 'bg-primary/20' : ''}`}
            onClick={() => setSortBy('name')}
          >
            A-Z
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex-1 ${sortBy === 'languages' ? 'bg-primary/20' : ''}`}
            onClick={() => setSortBy('languages')}
          >
            Languages
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 pr-4">
          {filteredCountries.map(country => (
            <button
              key={country.name}
              onClick={() => setSelectedCountry(country)}
              className={`w-full text-left p-2 rounded-lg transition-all hover:bg-white/10 ${
                selectedCountry?.name === country.name ? 'bg-primary/20 border-l-2 border-primary' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{country.name}</span>
                <span className="text-xs text-muted-foreground">
                  {country.languageCount > 1 ? `(${country.languageCount})` : country.languageCount === 0 ? '(?)' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {selectedCountry && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-muted-foreground mb-2">Translate to {selectedCountry.name}</p>
          {selectedCountry.languages.length === 0 ? (
            <p className="text-sm text-rose-400 italic">Languages unknown</p>
          ) : selectedCountry.languages.length === 1 ? (
            <Button 
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              onClick={() => setTargetLang(selectedCountry.languages[0])}
            >
              Set to {selectedCountry.languages[0].toUpperCase()}
            </Button>
          ) : (
            <div className="space-y-2">
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-sm"
                onChange={(e) => setTargetLang(e.target.value)}
              >
                <option value="">Choose language...</option>
                {selectedCountry.languages.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
