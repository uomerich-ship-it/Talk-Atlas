import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobeView } from "./components/globe/GlobeView";
import { TranslationPanel } from "./components/translation/TranslationPanel";
import { CountryListPanel } from "./components/countries/CountryListPanel";
import { useState } from "react";
import { Languages } from "lucide-react";

function TalkAtlasApp() {
  const [translationOpen, setTranslationOpen] = useState(false);

  return (
    <div
      className="flex h-screen w-full bg-[#020202] text-white overflow-hidden relative"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <CountryListPanel />

      <div className="flex-1 relative">
        <GlobeView />
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-stretch z-30">
        <button
          onClick={() => setTranslationOpen(v => !v)}
          className="flex flex-col items-center justify-center gap-1 px-2 py-5 rounded-l-2xl
                     bg-black/60 backdrop-blur-xl border-l border-t border-b border-primary/30
                     hover:bg-primary/10 hover:border-primary/60 transition-all group"
          style={{ writingMode: 'vertical-rl' }}
          title={translationOpen ? 'Close translator' : 'Open translator'}
          data-testid="button-toggle-translator"
        >
          <Languages className="w-5 h-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 group-hover:text-primary">
            {translationOpen ? '▶' : '◀'} Translate
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            translationOpen ? 'w-[420px] opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="w-[420px] h-full bg-black/70 backdrop-blur-2xl border-l border-primary/20
                          flex flex-col justify-center px-4 py-6 overflow-y-auto">
            <TranslationPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TalkAtlasApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
