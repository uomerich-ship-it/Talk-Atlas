import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Camera, ArrowRightLeft, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '../../store/useAppStore';
import { LANGUAGES } from '../../data/languages';

export function TranslationPanel() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const { targetLang, setTargetLang, isPremium } = useAppStore();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const translateMutation = useTranslate();

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    translateMutation.mutate({
      text: sourceText,
      sourceLang,
      targetLang
    });
  };

  const handleSwap = () => {
    const oldSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(oldSource);
  };

  const copyToClipboard = () => {
    if (translateMutation.data?.translated) {
      navigator.clipboard.writeText(translateMutation.data.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!" });
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 w-full max-w-2xl mx-auto shadow-2xl border-t border-white/20">
      <div className="flex items-center justify-between mb-6 bg-black/20 p-1.5 rounded-xl">
        <select 
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-transparent text-foreground border-none focus:ring-0 text-sm font-medium py-2 px-4 cursor-pointer hover:text-primary transition-colors"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-background text-foreground">{l.name}</option>)}
        </select>

        <button onClick={handleSwap} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-all">
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <select 
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-transparent text-primary border-none focus:ring-0 text-sm font-bold py-2 px-4 cursor-pointer hover:brightness-125 transition-colors text-right"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-background text-foreground">{l.name}</option>)}
        </select>
      </div>

      <div className="relative group">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter text to translate..."
          className="w-full h-32 bg-white/5 rounded-2xl p-4 pr-12 text-lg resize-none border border-transparent focus:border-primary/50 transition-all"
        />
        <div className="absolute right-3 bottom-3 flex gap-2">
          <button className="p-2 rounded-lg bg-black/40 hover:bg-primary/20 text-muted-foreground transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-black/40 hover:bg-primary/20 text-muted-foreground transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-center -my-3 z-10 relative">
        <button 
          onClick={handleTranslate}
          disabled={translateMutation.isPending || !sourceText}
          className="flex items-center gap-2 px-8 py-3 rounded-full font-bold tracking-wider text-sm uppercase bg-gradient-to-r from-primary to-cyan-400 text-black shadow-lg hover:scale-105 transition-all"
        >
          {translateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Translate
        </button>
      </div>

      <div className="mt-4 relative min-h-[8rem] bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="absolute top-0 right-0 p-2">
          {translateMutation.data && (
            <button onClick={copyToClipboard} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
        {translateMutation.data ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-medium text-primary">
            {translateMutation.data.translated}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30 text-sm italic">Translation results...</div>
        )}
      </div>

      {!isPremium && (
        <div className="mt-4 py-2 px-4 rounded-xl bg-white/5 border border-white/5 text-center flex items-center justify-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/30 font-bold">Ad</span>
          <span className="text-xs text-muted-foreground/40">Try TalkAtlas Premium to remove all ads</span>
        </div>
      )}
    </div>
  );
}
