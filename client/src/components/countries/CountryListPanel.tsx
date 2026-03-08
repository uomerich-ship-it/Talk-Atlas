import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Globe, Star, Clock, ChevronRight, Crown, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SettingsPanel } from '../ui/settings-panel';
import { startPremiumCheckout } from '../../services/stripe';
import { useToast } from '@/hooks/use-toast';
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

const getFlagEmoji = (countryName: string): string => {
  const flagMap: Record<string, string> = {
    'Afghanistan':'\u{1F1E6}\u{1F1EB}','Albania':'\u{1F1E6}\u{1F1F1}','Algeria':'\u{1F1E9}\u{1F1FF}','Argentina':'\u{1F1E6}\u{1F1F7}',
    'Australia':'\u{1F1E6}\u{1F1FA}','Austria':'\u{1F1E6}\u{1F1F9}','Bangladesh':'\u{1F1E7}\u{1F1E9}','Belgium':'\u{1F1E7}\u{1F1EA}',
    'Bolivia':'\u{1F1E7}\u{1F1F4}','Brazil':'\u{1F1E7}\u{1F1F7}','Bulgaria':'\u{1F1E7}\u{1F1EC}','Cambodia':'\u{1F1F0}\u{1F1ED}',
    'Canada':'\u{1F1E8}\u{1F1E6}','Chile':'\u{1F1E8}\u{1F1F1}','China':'\u{1F1E8}\u{1F1F3}','Colombia':'\u{1F1E8}\u{1F1F4}',
    'Croatia':'\u{1F1ED}\u{1F1F7}','Cuba':'\u{1F1E8}\u{1F1FA}','Czech Republic':'\u{1F1E8}\u{1F1FF}','Denmark':'\u{1F1E9}\u{1F1F0}',
    'Ecuador':'\u{1F1EA}\u{1F1E8}','Egypt':'\u{1F1EA}\u{1F1EC}','Ethiopia':'\u{1F1EA}\u{1F1F9}','Finland':'\u{1F1EB}\u{1F1EE}',
    'France':'\u{1F1EB}\u{1F1F7}','Germany':'\u{1F1E9}\u{1F1EA}','Ghana':'\u{1F1EC}\u{1F1ED}','Greece':'\u{1F1EC}\u{1F1F7}',
    'Guatemala':'\u{1F1EC}\u{1F1F9}','Honduras':'\u{1F1ED}\u{1F1F3}','Hungary':'\u{1F1ED}\u{1F1FA}','India':'\u{1F1EE}\u{1F1F3}',
    'Indonesia':'\u{1F1EE}\u{1F1E9}','Iran':'\u{1F1EE}\u{1F1F7}','Iraq':'\u{1F1EE}\u{1F1F6}','Ireland':'\u{1F1EE}\u{1F1EA}',
    'Israel':'\u{1F1EE}\u{1F1F1}','Italy':'\u{1F1EE}\u{1F1F9}','Jamaica':'\u{1F1EF}\u{1F1F2}','Japan':'\u{1F1EF}\u{1F1F5}',
    'Jordan':'\u{1F1EF}\u{1F1F4}','Kenya':'\u{1F1F0}\u{1F1EA}','South Korea':'\u{1F1F0}\u{1F1F7}','Kuwait':'\u{1F1F0}\u{1F1FC}',
    'Lebanon':'\u{1F1F1}\u{1F1E7}','Libya':'\u{1F1F1}\u{1F1FE}','Malaysia':'\u{1F1F2}\u{1F1FE}','Mexico':'\u{1F1F2}\u{1F1FD}',
    'Morocco':'\u{1F1F2}\u{1F1E6}','Mozambique':'\u{1F1F2}\u{1F1FF}','Myanmar':'\u{1F1F2}\u{1F1F2}','Nepal':'\u{1F1F3}\u{1F1F5}',
    'Netherlands':'\u{1F1F3}\u{1F1F1}','New Zealand':'\u{1F1F3}\u{1F1FF}','Nigeria':'\u{1F1F3}\u{1F1EC}','Norway':'\u{1F1F3}\u{1F1F4}',
    'Pakistan':'\u{1F1F5}\u{1F1F0}','Panama':'\u{1F1F5}\u{1F1E6}','Paraguay':'\u{1F1F5}\u{1F1FE}','Peru':'\u{1F1F5}\u{1F1EA}',
    'Philippines':'\u{1F1F5}\u{1F1ED}','Poland':'\u{1F1F5}\u{1F1F1}','Portugal':'\u{1F1F5}\u{1F1F9}','Qatar':'\u{1F1F6}\u{1F1E6}',
    'Romania':'\u{1F1F7}\u{1F1F4}','Russia':'\u{1F1F7}\u{1F1FA}','Saudi Arabia':'\u{1F1F8}\u{1F1E6}','Senegal':'\u{1F1F8}\u{1F1F3}',
    'Serbia':'\u{1F1F7}\u{1F1F8}','Singapore':'\u{1F1F8}\u{1F1EC}','Somalia':'\u{1F1F8}\u{1F1F4}','South Africa':'\u{1F1FF}\u{1F1E6}',
    'Spain':'\u{1F1EA}\u{1F1F8}','Sri Lanka':'\u{1F1F1}\u{1F1F0}','Sudan':'\u{1F1F8}\u{1F1E9}','Sweden':'\u{1F1F8}\u{1F1EA}',
    'Switzerland':'\u{1F1E8}\u{1F1ED}','Syria':'\u{1F1F8}\u{1F1FE}','Taiwan':'\u{1F1F9}\u{1F1FC}','Tanzania':'\u{1F1F9}\u{1F1FF}',
    'Thailand':'\u{1F1F9}\u{1F1ED}','Tunisia':'\u{1F1F9}\u{1F1F3}','Turkey':'\u{1F1F9}\u{1F1F7}','Uganda':'\u{1F1FA}\u{1F1EC}',
    'Ukraine':'\u{1F1FA}\u{1F1E6}','United Arab Emirates':'\u{1F1E6}\u{1F1EA}','United Kingdom':'\u{1F1EC}\u{1F1E7}',
    'United States of America':'\u{1F1FA}\u{1F1F8}','Uruguay':'\u{1F1FA}\u{1F1FE}','Venezuela':'\u{1F1FB}\u{1F1EA}',
    'Vietnam':'\u{1F1FB}\u{1F1F3}','Yemen':'\u{1F1FE}\u{1F1EA}','Zambia':'\u{1F1FF}\u{1F1F2}','Zimbabwe':'\u{1F1FF}\u{1F1FC}',
  };
  return flagMap[countryName] ?? '\u{1F310}';
};

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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

  const [countryInfo, setCountryInfo] = useState<{
    population: number;
    capital: string;
  } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const infoCache = useRef<Record<string, { population: number; capital: string }>>({});

  useEffect(() => {
    if (!selectedCountry) { setCountryInfo(null); return; }
    const name = selectedCountry.name;
    if (infoCache.current[name]) {
      setCountryInfo(infoCache.current[name]);
      return;
    }
    setLoadingInfo(true);
    fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=population,capital`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data[0]) {
          const info = {
            population: data[0].population ?? 0,
            capital: data[0].capital?.[0] ?? '',
          };
          infoCache.current[name] = info;
          setCountryInfo(info);
        }
      })
      .catch(() => setCountryInfo(null))
      .finally(() => setLoadingInfo(false));
  }, [selectedCountry]);

  const handlePremiumCheckout = async () => {
    setCheckoutLoading(true);
    const result = await startPremiumCheckout();
    setCheckoutLoading(false);
    if (!result.success) {
      toast({ title: "Premium Setup", description: result.error, variant: "destructive" });
    }
  };

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
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFlagEmoji(country.name)}</span>
            <span className="font-medium text-sm">{country.name}</span>
          </div>
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
    <div className="w-80 h-full glass-panel flex flex-col p-4 border-r border-white/10 z-20 overflow-hidden">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground/80">Talk Atlas</h2>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {selectedCountry && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getFlagEmoji(selectedCountry.name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary truncate">{selectedCountry.name}</p>
                {loadingInfo ? (
                  <div className="space-y-1 mt-1">
                    <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                ) : countryInfo ? (
                  <div className="space-y-0.5 mt-1">
                    {countryInfo.capital && (
                      <p className="text-[10px] text-muted-foreground/60">
                        {'\u{1F3D9}\u{FE0F}'} Capital: {countryInfo.capital}
                      </p>
                    )}
                    {countryInfo.population > 0 && (
                      <p className="text-[10px] text-muted-foreground/60">
                        {'\u{1F465}'} Population: {countryInfo.population.toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {selectedCountry.languages.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedCountry.languages.map((lang: string) => (
                  <span key={lang} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                    {lang}
                  </span>
                ))}
              </div>
            )}

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

      <ScrollArea className="flex-1 min-h-0 -mr-2 pr-2">
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

        <div className="flex flex-col gap-2">
          <SettingsPanel>
            <Button 
              variant={isPremium ? "ghost" : "outline"}
              className={isPremium 
                ? "w-full px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-center h-auto hover:bg-primary/10 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] group"
                : "w-full h-9 text-xs border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40"
              }
              data-testid="button-settings"
            >
              <span className={isPremium ? "text-[10px] uppercase font-bold text-primary tracking-widest group-hover:scale-105 transition-transform" : ""}>
                Premium Access – £1.99/mo
              </span>
            </Button>
          </SettingsPanel>

          <Button
            onClick={handlePremiumCheckout}
            disabled={checkoutLoading}
            className="w-full h-9 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:border-yellow-400/50 hover:bg-yellow-500/30 transition-all"
            variant="outline"
            data-testid="button-premium-checkout"
          >
            {checkoutLoading ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Crown className="w-3.5 h-3.5 mr-2" />
            )}
            {checkoutLoading ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
