import { motion } from 'framer-motion';
import { GlobeVisualization } from '@/components/Globe';
import { TranslationCard } from '@/components/TranslationCard';
import { SettingsDrawer } from '@/components/SettingsDrawer';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background text-foreground">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <GlobeVisualization />
      </div>

      {/* Overlay Gradient/Texture */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

      {/* Main Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">
        
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-start pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white neon-text">
              TALK<span className="text-primary">ATLAS</span>
            </h1>
            <p className="text-sm font-mono text-primary/70 tracking-[0.2em] uppercase mt-1">Universal Translator v1.0</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <SettingsDrawer />
          </motion.div>
        </header>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Interaction Area */}
        <main className="w-full p-4 md:p-8 pb-12 flex justify-center items-end pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="w-full max-w-2xl"
          >
            <TranslationCard />
          </motion.div>
        </main>

      </div>
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
    </div>
  );
}
