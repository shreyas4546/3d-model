
import React, { useState } from 'react';
import CodeRushBackground from './components/CodeRushBackground.tsx';
import UIOverlay from './components/UIOverlay.tsx';
import { DEFAULT_CONFIG } from './constants.ts';
import { AnimationConfig } from './types.ts';

const App: React.FC = () => {
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG);

  return (
    <main className="relative min-h-screen w-full bg-[#050505] overflow-hidden selection:bg-white selection:text-black">
      {/* Background Layer */}
      <CodeRushBackground config={config} />
      
      {/* Decorative Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black/80 z-[1]" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

      {/* UI Layer */}
      <UIOverlay config={config} setConfig={setConfig} />

      {/* Mobile Disclaimer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 text-center pointer-events-auto">
        <p className="text-[10px] uppercase tracking-widest text-white/40">Use desktop for full performance control</p>
      </div>
    </main>
  );
};

export default App;
