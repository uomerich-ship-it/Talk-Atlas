import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobeView } from "./components/globe/GlobeView";
import { TranslationPanel } from "./components/translation/TranslationPanel";
import { LeftDrawer } from "./components/left/LeftDrawer";
import { WayfinderPanel } from "./components/right/WayfinderPanel";
import { useState, useRef } from "react";
import { Languages, MapPin } from "lucide-react";

type RightTab = 'translate' | 'wayfinder' | null;

function TalkAtlasApp() {
  const [rightTab, setRightTab] = useState<RightTab>(null);
  const globeRef = useRef<any>(null);

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
        <GlobeView globeRef={globeRef} />
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
              <WayfinderPanel onFlyTo={handleFlyTo} />
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
