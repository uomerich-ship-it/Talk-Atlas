import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Camera, ArrowRightLeft, Sparkles, Loader2, Copy, Check, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '../../store/useAppStore';
import { LANGUAGES } from '../../data/languages';
import { translateText, type TranslationResult } from '../../services/translation';
import { useSpeechToText, getLangBCP47 } from '../../hooks/useSpeechToText';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function TranslationPanel() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const { targetLang, setTargetLang, isPremium } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const { toast } = useToast();

  const speechLang = getLangBCP47(sourceLang === 'auto' ? 'en' : sourceLang);
  const { status, transcript, interimTranscript, isSupported, startListening, stopListening } = useSpeechToText({
    language: speechLang,
    continuous: false,
    interimResults: true,
  });

  const isListening = status === 'listening';

  useEffect(() => {
    if (transcript) {
      setSourceText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (status === 'error') {
      toast({ title: "Microphone Error", description: "Could not access your microphone. Check permissions.", variant: "destructive" });
    }
  }, [status, toast]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const result = await translateText(
        sourceText,
        sourceLang === 'auto' ? null : sourceLang,
        targetLang
      );
      setTranslationResult(result);
    } catch (err: any) {
      setTranslationError(err.message || 'Translation failed');
      toast({ title: "Translation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const oldSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(oldSource);
    if (translationResult) {
      setSourceText(translationResult.translated);
      setTranslationResult(null);
    }
  };

  const copyToClipboard = () => {
    if (translationResult?.translated) {
      navigator.clipboard.writeText(translationResult.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!" });
    }
  };

  const handleSpeak = () => {
    if (translationResult?.translated) {
      const utterance = new SpeechSynthesisUtterance(translationResult.translated);
      utterance.lang = getLangBCP47(targetLang);
      speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const displayText = isListening && interimTranscript
    ? sourceText + (sourceText ? ' ' : '') + interimTranscript
    : sourceText;

  return (
    <div className="glass-panel rounded-3xl p-6 w-full max-w-2xl mx-auto shadow-2xl border-t border-white/20" data-testid="translation-panel">
      <div className="flex items-center justify-between mb-6 bg-black/20 p-1.5 rounded-xl">
        <select 
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-transparent text-foreground border-none focus:ring-0 text-sm font-medium py-2 px-4 cursor-pointer hover:text-primary transition-colors"
          data-testid="select-source-lang"
        >
          <option value="auto" className="bg-background text-foreground">Auto-detect</option>
          {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-background text-foreground">{l.name}</option>)}
        </select>

        <button
          onClick={handleSwap}
          className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-all"
          data-testid="button-swap-langs"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <select 
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-transparent text-primary border-none focus:ring-0 text-sm font-bold py-2 px-4 cursor-pointer hover:brightness-125 transition-colors text-right"
          data-testid="select-target-lang"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-background text-foreground">{l.name}</option>)}
        </select>
      </div>

      <div className="relative group">
        <textarea
          value={displayText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter text to translate..."
          className={`w-full h-32 bg-white/5 rounded-2xl p-4 pr-12 text-lg resize-none border border-transparent focus:border-primary/50 transition-all ${isListening ? 'italic text-white/60' : ''}`}
          onKeyDown={handleKeyDown}
          data-testid="input-source-text"
        />
        <div className="absolute right-3 bottom-3 flex gap-2">
          {isSupported ? (
            <button
              onClick={handleMicClick}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500/30 text-red-400 animate-pulse'
                  : 'bg-black/40 hover:bg-primary/20 text-muted-foreground'
              }`}
              data-testid="button-mic"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled
                  className="p-2 rounded-lg bg-black/40 text-muted-foreground/30 cursor-not-allowed"
                  data-testid="button-mic-disabled"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Not supported in this browser</TooltipContent>
            </Tooltip>
          )}
          <button
            className="p-2 rounded-lg bg-black/40 hover:bg-primary/20 text-muted-foreground transition-colors"
            data-testid="button-camera"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-center -my-3 z-10 relative">
        <button 
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText}
          className="flex items-center gap-2 px-8 py-3 rounded-full font-bold tracking-wider text-sm uppercase bg-gradient-to-r from-primary to-cyan-400 text-black shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-translate"
        >
          {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </div>

      <div className="mt-4 relative min-h-[8rem] bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="absolute top-0 right-0 p-2 flex gap-1">
          {translationResult && (
            <>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground"
                data-testid="button-speak"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={copyToClipboard} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground" data-testid="button-copy">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>

        {translationResult ? (
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-medium text-primary" data-testid="text-translation-result">
              {translationResult.translated}
            </motion.div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  translationResult.service === 'deepl'
                    ? 'bg-blue-500/20 text-blue-400'
                    : translationResult.service === 'openai'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
                data-testid="badge-service"
              >
                {translationResult.service === 'deepl' ? 'DeepL' : translationResult.service === 'openai' ? 'AI' : 'Free'}
              </span>
              {translationResult.detectedSourceLang && (
                <span className="text-[10px] text-muted-foreground/50" data-testid="text-detected-lang">
                  Detected: {translationResult.detectedSourceLang}
                </span>
              )}
            </div>
          </div>
        ) : translationError ? (
          <div className="flex items-center justify-center h-full text-red-400/60 text-sm" data-testid="text-translation-error">
            {translationError}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30 text-sm italic" data-testid="text-translation-placeholder">
            Translation results...
          </div>
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
