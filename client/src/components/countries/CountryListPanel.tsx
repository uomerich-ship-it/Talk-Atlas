import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Globe, Star, Clock, ChevronRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SettingsPanel } from '../ui/settings-panel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export function CountryListPanel() {
  const { 
    countries, 
    selectedCountry, 
    setSelectedCountry, 
    targetLang,
    setTargetLang,
    pinnedCountries,
    togglePin,
    recentCountries,
    clearRecent,
    isPremium
  } = useAppStore();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'languages'>('name');

  const processedCountries = useMemo(() => {
    return countries
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.languageCount - a.languageCount;
      });
  }, [countries, search, sortBy]);

  const pinnedList = processedCountries.filter(c => pinnedCountries.includes(c.iso3 || c.name));
  const recentList = recentCountries
    .map(id => countries.find(c => (c.iso3 || c.name) === id))
    .filter(Boolean) as any[];
  const otherList = processedCountries.filter(c => !pinnedCountries.includes(c.iso3 || c.name));

  const renderCountryRow = (country: any) => (
    <div
      key={country.name}
      className={`group flex items-center gap-1 w-full p-1 rounded-lg transition-all hover:bg-white/10 ${
        selectedCountry?.name === country.name ? 'bg-primary/20' : ''
      }`}
    >
      <button
        onClick={() => togglePin(country.iso3 || country.name)}
        className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
          pinnedCountries.includes(country.iso3 || country.name) ? 'text-yellow-400' : 'text-muted-foreground/40'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${pinnedCountries.includes(country.iso3 || country.name) ? 'fill-current' : ''}`} />
      </button>
      <button
        onClick={() => setSelectedCountry(country)}
        className="flex-1 text-left p-1.5"
      >
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{country.name}</span>
          {country.languageCount > 1 && (
            <span className="text-[10px] text-muted-foreground/60 px-1.5 py-0.5 rounded-full bg-white/5">
              {country.languageCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );

  return (
    <div className="w-80 h-full glass-panel flex flex-col p-4 border-r border-white/10 z-20">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground/80">Talk Atlas</h2>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {selectedCountry && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] uppercase font-bold text-primary/60 mb-2 tracking-widest">Quick Actions</p>
            {selectedCountry.languages.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No language data available</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedCountry.languages.length > 1 ? (
                  <div className="flex gap-2">
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger className="h-8 bg-black/40 border-white/10 text-xs">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCountry.languages.map((lang: string) => (
                          <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setTargetLang(selectedCountry.languages[0])}
                  >
                    Translate to {selectedCountry.name}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input 
            placeholder="Search nations..." 
            className="h-9 pl-9 bg-white/5 border-white/10 text-sm focus-visible:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-1 p-1 bg-black/20 rounded-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex-1 h-7 text-[10px] uppercase font-bold transition-all ${sortBy === 'name' ? 'bg-white/10 text-primary' : 'text-muted-foreground'}`}
            onClick={() => setSortBy('name')}
          >
            Alpha
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex-1 h-7 text-[10px] uppercase font-bold transition-all ${sortBy === 'languages' ? 'bg-white/10 text-primary' : 'text-muted-foreground'}`}
            onClick={() => setSortBy('languages')}
          >
            Polyglot
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 -mr-2 pr-2">
        <div className="space-y-4">
          {pinnedList.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 mb-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Pinned</span>
              </div>
              {pinnedList.map(renderCountryRow)}
            </div>
          )}

          {recentList.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Recent</span>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors">Clear</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear recent selections?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will remove all your recently selected nations from the list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearRecent} className="bg-primary text-black hover:bg-primary/90">Yes</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {recentList.map(renderCountryRow)}
            </div>
          )}

          <div className="space-y-1">
            <div className="px-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">All Countries</span>
            </div>
            {otherList.map(renderCountryRow)}
          </div>
        </div>
      </ScrollArea>

      <div className="mt-4 space-y-3">
        {!isPremium && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center animate-in fade-in duration-700">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Sponsored</p>
            <p className="text-xs text-muted-foreground/60 italic">Your ad could be here</p>
          </div>
        )}

        <SettingsPanel>
          {!isPremium ? (
            <Button 
              variant="outline" 
              className="w-full h-9 text-xs border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40"
            >
              Premium Access – £1.99/mo
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-center h-auto hover:bg-primary/10 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] group"
            >
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest group-hover:scale-105 transition-transform">Premium Active – Manage</span>
            </Button>
          )}
        </SettingsPanel>
      </div>
    </div>
  );
}
