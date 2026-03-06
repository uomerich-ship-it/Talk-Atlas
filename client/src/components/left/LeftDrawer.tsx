import { useState } from 'react';
import { Globe2, BookOpen, Lightbulb } from 'lucide-react';
import { CountryListPanel } from '../countries/CountryListPanel';
import { PhrasebookPanel } from './PhrasebookPanel';
import { CulturalTipsPanel } from './CulturalTipsPanel';

type Tab = 'countries' | 'phrasebook' | 'culture';

export function LeftDrawer() {
  const [activeTab, setActiveTab] = useState<Tab | null>('countries');

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'countries',  icon: <Globe2 className="w-5 h-5" />,     label: 'Countries'  },
    { id: 'phrasebook', icon: <BookOpen className="w-5 h-5" />,   label: 'Phrases'    },
    { id: 'culture',    icon: <Lightbulb className="w-5 h-5" />,  label: 'Culture'    },
  ];

  return (
    <div className="flex h-full z-30 relative">
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          activeTab ? 'w-72 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div className="w-72 h-full bg-black/70 backdrop-blur-2xl border-r border-primary/20 flex flex-col overflow-hidden">
          {activeTab === 'countries'  && <CountryListPanel />}
          {activeTab === 'phrasebook' && <PhrasebookPanel />}
          {activeTab === 'culture'    && <CulturalTipsPanel />}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 py-4 px-1
                      bg-black/60 backdrop-blur-xl border-r border-primary/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(prev => prev === tab.id ? null : tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all group w-12
              ${activeTab === tab.id
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-muted-foreground hover:text-primary hover:bg-white/5'
              }`}
            title={tab.label}
            data-testid={`button-tab-${tab.id}`}
          >
            {tab.icon}
            <span className="text-[8px] uppercase font-bold tracking-wider leading-none">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
