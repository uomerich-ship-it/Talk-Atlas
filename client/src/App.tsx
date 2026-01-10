import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobeView } from "./components/globe/GlobeView";
import { TranslationPanel } from "./components/translation/TranslationPanel";
import { CountryListPanel } from "./components/countries/CountryListPanel";

function TalkAtlasApp() {
  return (
    <div className="flex h-screen w-full bg-[#020202] text-white overflow-hidden relative font-sans">
      <CountryListPanel />

      <div className="flex-1 flex flex-col relative z-10">
        <header className="absolute top-0 right-0 p-6 z-20 pointer-events-none">
          <div className="flex flex-col items-end">
            <h1 className="text-xl font-bold tracking-[0.3em] uppercase neon-text opacity-80">TalkAtlas</h1>
            <div className="h-[1px] w-12 bg-primary/30 mt-1" />
          </div>
        </header>

        <GlobeView />
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full px-4 max-w-2xl">
          <TranslationPanel />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TalkAtlasApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
