import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, Save, Loader2, Key, Globe } from "lucide-react";
import { useSettings, useUpdateSetting } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';

export function SettingsDrawer() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [globalRules, setGlobalRules] = useState('');
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      const keySetting = settings.find(s => s.key === 'openai_api_key');
      const rulesSetting = settings.find(s => s.key === 'global_rules');
      if (keySetting) setOpenaiKey(keySetting.value);
      if (rulesSetting) setGlobalRules(rulesSetting.value);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'openai_api_key', value: openaiKey }),
        updateSetting.mutateAsync({ key: 'global_rules', value: globalRules })
      ]);
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-3 rounded-full glass-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:rotate-90 duration-500 shadow-lg">
          <Settings className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-black/90 backdrop-blur-xl border-l border-white/10 text-foreground p-0">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10">
            <SheetHeader>
              <SheetTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-secondary" />
                Config Panel
              </SheetTitle>
              <p className="text-muted-foreground text-sm">Manage API keys and translation behavior.</p>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* API Key Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                <Key className="w-4 h-4" />
                <span>API Configuration</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">OpenAI API Key</label>
                <input 
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 font-mono"
                />
                <p className="text-[10px] text-muted-foreground/60">Required for translation services to function.</p>
              </div>
            </div>

            {/* Global Rules Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-wider text-sm">
                <Globe className="w-4 h-4" />
                <span>Global Context</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Translation Rules & Context</label>
                <textarea 
                  value={globalRules}
                  onChange={(e) => setGlobalRules(e.target.value)}
                  placeholder="E.g. Always use formal tone, never translate proper nouns..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all placeholder:text-muted-foreground/30 resize-none"
                />
                <p className="text-[10px] text-muted-foreground/60">AI will consider these rules for every translation.</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-black/40">
            <button 
              onClick={handleSave}
              disabled={updateSetting.isPending || isLoading}
              className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-orange-500 text-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
