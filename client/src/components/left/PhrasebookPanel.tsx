import { useState } from 'react';
import { BookOpen, Loader2, Volume2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getPhrasebook, type Phrase } from '../../services/aiFeatures';

const CATEGORY_COLORS: Record<string, string> = {
  Greeting:   'bg-blue-500/20 text-blue-300',
  Food:       'bg-orange-500/20 text-orange-300',
  Navigation: 'bg-green-500/20 text-green-300',
  Emergency:  'bg-red-500/20 text-red-300',
  Shopping:   'bg-purple-500/20 text-purple-300',
  Polite:     'bg-cyan-500/20 text-cyan-300',
};

export function PhrasebookPanel() {
  const { selectedCountry, targetLang } = useAppStore();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!selectedCountry) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getPhrasebook(selectedCountry.name, targetLang);
      setPhrases(result);
      setGenerated(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate phrasebook');
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string, lang: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Phrasebook</h3>
      </div>

      {!selectedCountry ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-muted-foreground/50 text-xs" data-testid="text-phrasebook-empty">Select a country on the globe to generate phrases</p>
        </div>
      ) : (
        <>
          <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground/60">Country</p>
            <p className="text-sm font-bold text-primary" data-testid="text-phrasebook-country">{selectedCountry.name}</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Language: {targetLang.toUpperCase()}</p>
          </div>

          {!generated && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary/80 to-cyan-400/80
                         text-black text-sm font-bold uppercase tracking-wider
                         hover:from-primary hover:to-cyan-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              data-testid="button-generate-phrases"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Phrases'}
            </button>
          )}

          {error && <p className="text-red-400 text-xs mt-2" data-testid="text-phrasebook-error">{error}</p>}

          <div className="flex-1 overflow-y-auto mt-3 space-y-2 hide-scrollbar">
            {phrases.map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all" data-testid={`card-phrase-${i}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${CATEGORY_COLORS[p.category] ?? 'bg-white/10 text-white/50'}`}>
                    {p.category}
                  </span>
                  <button onClick={() => speak(p.translated, targetLang)} className="text-muted-foreground/50 hover:text-primary transition-colors" data-testid={`button-speak-phrase-${i}`}>
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground/70 mb-0.5">{p.english}</p>
                <p className="text-sm font-bold text-primary">{p.translated}</p>
                <p className="text-[10px] text-muted-foreground/40 italic mt-0.5">{p.phonetic}</p>
              </div>
            ))}
            {generated && (
              <button onClick={handleGenerate} disabled={loading}
                className="w-full py-2 text-xs text-primary/60 hover:text-primary border border-white/5 hover:border-primary/20 rounded-xl transition-all"
                data-testid="button-regenerate-phrases">
                Regenerate
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
