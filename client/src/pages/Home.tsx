import { motion } from 'framer-motion';
import { GlobeVisualization } from '@/components/Globe';
import { TranslationCard } from '@/components/TranslationCard';
import { SettingsDrawer } from '@/components/SettingsDrawer';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background text-foreground">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0" style={{ opacity: 1 }}>
        <div style={{ position: 'absolute', top: '-8%', left: 0, right: 0, bottom: 0 }}>
          <GlobeVisualization />
          {/* Globe atmospheric glow ring */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -58%)',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'transparent',
            boxShadow: '0 0 80px rgba(0, 255, 255, 0.12), 0 0 160px rgba(0, 200, 255, 0.06)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        </div>
      </div>

      {/* Deep space nebula effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Blue nebula top-right */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(0, 80, 180, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        {/* Cyan nebula center */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '60%',
          height: '50%',
          background: 'radial-gradient(ellipse, rgba(0, 180, 220, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        {/* Purple accent bottom-left */}
        <div style={{
          position: 'absolute',
          bottom: '0%',
          left: '-5%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(ellipse, rgba(80, 0, 180, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
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
