import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Camera, ArrowRightLeft, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
];

export function TranslationCard() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
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
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translateMutation.data) {
      setSourceText(translateMutation.data.translated);
      // We can't easily swap the result back without re-translating, but for UX let's clear or re-fetch
    }
  };

  const copyToClipboard = () => {
    if (translateMutation.data?.translated) {
      navigator.clipboard.writeText(translateMutation.data.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Translation copied to clipboard." });
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 w-full max-w-2xl mx-auto shadow-2xl border-t border-white/20">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6 bg-black/20 p-1.5 rounded-xl">
        <select 
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-transparent text-foreground border-none focus:ring-0 text-sm font-medium py-2 px-4 cursor-pointer hover:text-primary transition-colors"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-background text-foreground">{l.name}</option>)}
        </select>

        <button 
          onClick={handleSwap}
          className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-all active:rotate-180"
        >
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

      {/* Input Area */}
      <div className="relative group">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter text to translate..."
          className="w-full h-32 bg-white/5 rounded-2xl p-4 pr-12 text-lg resize-none border border-transparent focus:border-primary/50 focus:ring-0 focus:bg-white/10 transition-all placeholder:text-muted-foreground/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleTranslate();
            }
          }}
        />
        <div className="absolute right-3 bottom-3 flex gap-2">
          <button className="p-2 rounded-lg bg-black/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors border border-white/5 hover:border-primary/30">
            <Mic className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-black/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors border border-white/5 hover:border-primary/30">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Translate Action */}
      <div className="flex justify-center -my-3 z-10 relative">
        <button 
          onClick={handleTranslate}
          disabled={translateMutation.isPending || !sourceText}
          className="
            flex items-center gap-2 px-8 py-3 rounded-full font-bold tracking-wider text-sm uppercase
            bg-gradient-to-r from-primary via-cyan-400 to-primary
            text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]
            hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            transition-all duration-300
          "
        >
          {translateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {translateMutation.isPending ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {/* Output Area */}
      <div className="mt-4 relative min-h-[8rem] bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="absolute top-0 right-0 p-2">
          {translateMutation.data && (
            <button 
              onClick={copyToClipboard}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        {translateMutation.data ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium text-primary leading-relaxed pt-1"
          >
            {translateMutation.data.translated}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[6rem] text-muted-foreground/30 text-sm italic">
            Translation will appear here...
          </div>
        )}
      </div>
    </div>
  );
}
