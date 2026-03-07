import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobeView } from "./components/globe/GlobeView";
import { TranslationPanel } from "./components/translation/TranslationPanel";
import { LeftDrawer } from "./components/left/LeftDrawer";
import { WayfinderPanel } from "./components/right/WayfinderPanel";
import { AboutModal } from "./components/ui/AboutModal";
import { TutorialOverlay } from "./components/ui/TutorialOverlay";
import { useState, useRef, useEffect } from "react";
import { Languages, MapPin, Info } from "lucide-react";
import { AnimatePresence } from "framer-motion";

type RightTab = 'translate' | 'wayfinder' | null;

function TalkAtlasApp() {
  const [rightTab, setRightTab] = useState<RightTab>(null);
  const globeRef = useRef<any>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('talkAtlas_tutorial_seen');
    if (!seen) {
      localStorage.setItem('talkAtlas_tutorial_seen', 'true');
      setTimeout(() => setShowTutorial(true), 1500);
    }
  }, []);

  const handleFlyTo = (lat: number, lng: number) => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1500);
    }
  };

  const rightTabs = [
    { id: 'translate' as RightTab, icon: <Languages className="w-5 h-5" />, label: 'Translate' },
    { id: 'wayfinder' as RightTab, icon: <MapPin className="w-5 h-5" />,    label: 'Wayfinder' },
  ];

  return (
    <div
      className="flex h-screen w-full bg-[#020202] text-white overflow-hidden relative"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <LeftDrawer />

      <div className="flex-1 relative min-w-0">
        <GlobeView ref={globeRef} />
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-stretch z-30">
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${rightTab ? 'w-[400px] opacity-100' : 'w-0 opacity-0'}`}>
          <div className="w-[400px] h-full bg-black/70 backdrop-blur-2xl border-l border-primary/20 flex flex-col justify-start overflow-y-auto">
            {rightTab === 'translate' && (
              <div className="p-4">
                <TranslationPanel />
              </div>
            )}
            {rightTab === 'wayfinder' && (
              <WayfinderPanel onFlyTo={handleFlyTo} globeRef={globeRef} />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 py-4 px-1 bg-black/60 backdrop-blur-xl border-l border-primary/20">
          {rightTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setRightTab(prev => prev === tab.id ? null : tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all group w-12
                ${rightTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'text-muted-foreground hover:text-primary hover:bg-white/5'
                }`}
              title={tab.label ?? ''}
              data-testid={tab.id === 'translate' ? 'button-toggle-translator' : `button-right-tab-${tab.id}`}
            >
              {tab.icon}
              <span className="text-[8px] uppercase font-bold tracking-wider leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowAbout(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20
                   flex items-center gap-2 px-4 py-2 rounded-full
                   bg-black/50 backdrop-blur-xl border border-white/10
                   hover:border-primary/30 text-muted-foreground
                   hover:text-primary transition-all text-xs font-bold
                   uppercase tracking-wider"
        data-testid="button-about"
      >
        <Info className="w-3.5 h-3.5" />
        About TalkAtlas
      </button>

      <AnimatePresence>
        {showAbout && (
          <AboutModal
            onClose={() => setShowAbout(false)}
            onOpenTutorial={() => { setShowAbout(false); setShowTutorial(true); }}
          />
        )}
      </AnimatePresence>
      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}
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
