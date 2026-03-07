import { useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutModalProps {
  onClose: () => void;
  onOpenTutorial: () => void;
}

const features = [
  { icon: '\u{1F30D}', title: 'Interactive Globe', desc: 'Spin a photorealistic 3D Earth and tap any of 195 countries' },
  { icon: '\u{1F310}', title: 'AI Translation', desc: 'Powered by DeepL and OpenAI for natural, accurate translations' },
  { icon: '\u{1F3A4}', title: 'Voice Input', desc: 'Speak to translate — hands-free voice recognition built in' },
  { icon: '\u{1F50A}', title: 'Text to Speech', desc: 'Hear your translation spoken aloud in the target language' },
  { icon: '\u{1F4D6}', title: 'Phrasebook', desc: 'AI-generated travel phrases for any country, with pronunciation' },
  { icon: '\u{1F4A1}', title: 'Culture Guide', desc: 'Learn customs, etiquette and tips before you visit' },
  { icon: '\u{1F5FA}\u{FE0F}', title: 'Wayfinder', desc: 'Search places, get directions, and fly the globe to any location' },
  { icon: '\u{1FA9F}', title: 'Street View', desc: 'Explore destinations at street level before you arrive' },
];

export function AboutModal({ onClose, onOpenTutorial }: AboutModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl overflow-y-auto outline-none"
        data-testid="modal-about"
      >
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          data-testid="button-close-about"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-w-2xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="text-7xl mb-4">{'\u{1F30D}'}</div>
            <h1 id="about-title" className="text-4xl font-black tracking-tight text-primary mb-3" style={{ fontFamily: 'Oxanium, system-ui, sans-serif' }}>
              TalkAtlas
            </h1>
            <p className="text-white/75 text-sm max-w-md mx-auto leading-relaxed">
              The world in your hands. Every language at your fingertips.
            </p>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-3">Version 1.0.0</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-primary mb-3" style={{ fontFamily: 'Oxanium, system-ui, sans-serif' }}>
              What is TalkAtlas?
            </h2>
            <p className="text-sm text-white/75 leading-relaxed">
              TalkAtlas is a next-generation travel companion and language translation app built around a stunning interactive 3D globe. Spin the Earth, tap any country, and instantly translate, explore travel phrases, discover cultural tips, and find places — all in your chosen language.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-primary mb-4" style={{ fontFamily: 'Oxanium, system-ui, sans-serif' }}>
              Features
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.08)] transition-all duration-300 cursor-default">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</div>
                  <p className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors">{f.title}</p>
                  <p className="text-[11px] text-white/75 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-primary mb-4" style={{ fontFamily: 'Oxanium, system-ui, sans-serif' }}>
              How It Works
            </h2>
            <div className="space-y-3">
              {[
                { num: '1', text: 'Spin the globe and tap a country' },
                { num: '2', text: 'Choose a feature — Translate, Phrases, Culture or Wayfinder' },
                { num: '3', text: 'Communicate confidently in any language' },
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center">
                    {step.num}
                  </span>
                  <p className="text-sm text-white">{step.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-primary mb-4" style={{ fontFamily: 'Oxanium, system-ui, sans-serif' }}>
              How to Use TalkAtlas
            </h2>
            <button
              onClick={onOpenTutorial}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all group"
              data-testid="button-reopen-tutorial"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{'\u{1F393}'}</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                    Watch the Tutorial
                  </p>
                  <p className="text-xs text-white/50">
                    A quick 6-step guide to all features
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10 p-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/5"
          >
            <h2 className="text-lg font-bold text-yellow-400 mb-1" style={{ fontFamily: 'Oxanium, system-ui, sans-serif' }}>
              TalkAtlas Premium
            </h2>
            <p className="text-sm text-yellow-400/60 mb-4">{'\u00A3'}1.99 / month</p>
            <ul className="space-y-2 mb-5">
              {[
                'Unlimited translations',
                'Remove all ads',
                'Priority AI features',
                'Early access to new features',
              ].map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/75">
                  <span className="text-yellow-400 text-xs">{'\u2726'}</span>
                  {b}
                </li>
              ))}
            </ul>
            <button
              className="w-full py-3 rounded-full bg-gradient-to-r from-yellow-600/80 to-yellow-400/80 text-black text-sm font-bold uppercase tracking-wider hover:from-yellow-600 hover:to-yellow-400 transition-all"
              data-testid="button-about-upgrade"
            >
              Upgrade to Premium
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-t border-white/10 pt-6"
          >
            <p className="text-[10px] text-white/30 text-center uppercase tracking-widest mb-3">Powered by</p>
            <div className="flex justify-center gap-3 flex-wrap mb-6">
              {['DeepL', 'OpenAI', 'Google Places', 'RevenueCat'].map(t => (
                <span key={t} className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-bold uppercase tracking-wider hover:text-primary hover:border-primary/40 transition-colors">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-white/60 mb-1">
              Made with {'\u2764\u{FE0F}'} for travellers worldwide
            </p>
            <p className="text-center text-[10px] text-white/20 mb-3">
              {'\u00A9'} 2025 TalkAtlas
            </p>
            <div className="flex justify-center gap-4">
              <button className="text-[10px] text-white/30 hover:text-primary transition-colors" data-testid="button-privacy-policy">Privacy Policy</button>
              <button className="text-[10px] text-white/30 hover:text-primary transition-colors" data-testid="button-support">Support</button>
            </div>
          </motion.div>
        </div>
      </motion.div>
  );
}
