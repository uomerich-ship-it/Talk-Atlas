import { useState } from 'react';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getCulturalTips, type CulturalTip } from '../../services/aiFeatures';

export function CulturalTipsPanel() {
  const { selectedCountry } = useAppStore();
  const [tips, setTips] = useState<CulturalTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!selectedCountry) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCulturalTips(selectedCountry.name);
      setTips(result);
    } catch (e: any) {
      setError(e.message ?? 'Failed to get tips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Culture Guide</h3>
      </div>

      {!selectedCountry ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-muted-foreground/50 text-xs" data-testid="text-culture-empty">Select a country on the globe to see cultural tips</p>
        </div>
      ) : (
        <>
          <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground/60">Visiting</p>
            <p className="text-sm font-bold text-primary" data-testid="text-culture-country">{selectedCountry.name}</p>
          </div>

          {tips.length === 0 && (
            <button
              onClick={handleFetch}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/70 to-primary/70
                         text-black text-sm font-bold uppercase tracking-wider
                         hover:from-yellow-400 hover:to-primary disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              data-testid="button-get-tips"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              {loading ? 'Loading...' : 'Get Cultural Tips'}
            </button>
          )}

          {error && <p className="text-red-400 text-xs mt-2" data-testid="text-culture-error">{error}</p>}

          <div className="flex-1 overflow-y-auto mt-3 space-y-2 hide-scrollbar">
            {tips.map((tip, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-400/20 transition-all" data-testid={`card-tip-${i}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{tip.icon}</span>
                  <span className="text-xs font-bold text-yellow-300/80">{tip.title}</span>
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
            {tips.length > 0 && (
              <button onClick={handleFetch} disabled={loading}
                className="w-full py-2 text-xs text-primary/60 hover:text-primary border border-white/5 hover:border-primary/20 rounded-xl transition-all flex items-center justify-center gap-1"
                data-testid="button-refresh-tips">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
