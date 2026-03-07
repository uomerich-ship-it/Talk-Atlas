import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialOverlayProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to TalkAtlas \u{1F30D}',
    body: 'Your intelligent travel companion. Let us show you around in just a few quick steps.',
    button: "Let's Go \u2192",
    highlight: null,
  },
  {
    title: 'Spin the Globe',
    body: 'Drag to rotate the Earth. Tap any country to select it — the app will automatically set the language for that country.',
    button: 'Next \u2192',
    highlight: 'center',
  },
  {
    title: 'Countries, Phrases & Culture',
    body: 'Tap the icons on the left to explore country info, get AI-generated travel phrases, and discover cultural tips for wherever you\'re visiting.',
    button: 'Next \u2192',
    highlight: 'left',
  },
  {
    title: 'Translate Anything',
    body: 'Tap Translate on the right. Type text or tap the microphone to speak. Your words are instantly translated into the country\'s language.',
    button: 'Next \u2192',
    highlight: 'right-translate',
  },
  {
    title: 'Find Any Place',
    body: 'Tap Wayfinder to search for restaurants, hospitals, landmarks and more. Get directions with translated turn-by-turn steps — and explore in Street View.',
    button: 'Next \u2192',
    highlight: 'right-wayfinder',
  },
  {
    title: 'Go Premium for the Full Experience',
    body: 'Unlock unlimited translations, remove ads, and get priority AI features for just \u00A31.99/month.',
    button: null,
    highlight: null,
  },
];

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleFinish();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleFinish = () => {
    localStorage.setItem('talkAtlas_tutorial_seen', 'true');
    onClose();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  const current = steps[step];

  const getSpotlightStyle = (): React.CSSProperties => {
    switch (current.highlight) {
      case 'center':
        return {
          background: 'radial-gradient(ellipse 40% 50% at 50% 45%, transparent 0%, rgba(0,0,0,0.75) 100%)',
        };
      case 'left':
        return {
          background: 'radial-gradient(ellipse 25% 40% at 8% 50%, transparent 0%, rgba(0,0,0,0.75) 100%)',
        };
      case 'right-translate':
        return {
          background: 'radial-gradient(ellipse 10% 12% at 97% 42%, transparent 0%, rgba(0,0,0,0.75) 100%)',
        };
      case 'right-wayfinder':
        return {
          background: 'radial-gradient(ellipse 10% 12% at 97% 55%, transparent 0%, rgba(0,0,0,0.75) 100%)',
        };
      default:
        return { background: 'rgba(0,0,0,0.75)' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] backdrop-blur-sm"
      style={getSpotlightStyle()}
      data-testid="overlay-tutorial"
    >
      <button
        onClick={handleFinish}
        className="fixed top-6 right-6 z-[70] text-muted-foreground/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        data-testid="button-skip-tutorial"
      >
        Skip tutorial
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-sm w-full mx-4 glass-panel rounded-3xl p-6 border border-white/10 z-[70]"
        >
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-white/10'
                }`}
              />
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/30 text-center uppercase tracking-widest mb-3">
            {step + 1} of {steps.length}
          </p>

          <h3 className="text-lg font-bold text-white text-center mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground/60 text-center leading-relaxed mb-6">{current.body}</p>

          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold text-sm uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              data-testid="button-tutorial-next"
            >
              {current.button}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 text-muted-foreground font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                data-testid="button-tutorial-skip"
              >
                Start Free
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-yellow-600/80 to-yellow-400/80 text-black font-bold text-sm uppercase tracking-wider hover:from-yellow-600 hover:to-yellow-400 transition-all"
                data-testid="button-tutorial-upgrade"
              >
                Upgrade Now {'\u2192'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
