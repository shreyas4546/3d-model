
import React, { useState } from 'react';
import { AnimationConfig } from '../types.ts';
import { THEMES } from '../constants.ts';
import { getThemeSuggestion, explainAnimation } from '../services/geminiService.ts';

interface Props {
  config: AnimationConfig;
  setConfig: React.Dispatch<React.SetStateAction<AnimationConfig>>;
}

const UIOverlay: React.FC<Props> = ({ config, setConfig }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleGeminiTheme = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const suggestion = await getThemeSuggestion(prompt);
      setConfig(prev => ({ ...prev, ...suggestion }));
      setPrompt('');
    } catch (err) {
      setError("Failed to generate theme. Please try a different prompt or check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    try {
      const text = await explainAnimation(config);
      setExplanation(text);
    } catch (err) {
      setError("Could not retrieve explanation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 p-6 flex flex-col md:flex-row gap-6 pointer-events-none h-screen overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 pointer-events-auto flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <h1 className="text-xl font-bold tracking-tight text-white/90 ml-2">CodeFlow</h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-[10px] text-red-200 animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">Famous Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(THEMES).map(theme => (
              <button
                key={theme}
                onClick={() => {
                  setConfig(prev => ({ ...prev, ...THEMES[theme], themeName: theme }));
                  setError(null);
                }}
                className={`text-[10px] py-2 px-2 rounded-lg border transition-all truncate ${
                  config.themeName === theme 
                  ? 'border-white/40 bg-white/10 text-white' 
                  : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">AI Generative Style</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Liquid gold boids"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
              onKeyDown={(e) => e.key === 'Enter' && handleGeminiTheme()}
            />
            <button
              onClick={handleGeminiTheme}
              disabled={loading}
              className="bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Synthesizing...' : 'Generate Algorithm'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">Live Tuning</label>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Active Logic</span>
                <span className="text-white capitalize font-mono">{config.animationStyle}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Particles</span>
                <span>{config.particleCount}</span>
              </div>
              <input 
                type="range" min="10" max="250" 
                value={config.particleCount} 
                onChange={(e) => setConfig(prev => ({...prev, particleCount: parseInt(e.target.value)}))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Velocity</span>
                <span>{config.speed.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.1" max="8.0" step="0.1"
                value={config.speed} 
                onChange={(e) => setConfig(prev => ({...prev, speed: parseFloat(e.target.value)}))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleExplain}
          disabled={loading}
          className="mt-auto w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Consulting Gemini...' : 'Explain Algorithm Logic'}
        </button>
      </div>

      {/* Main Content Info */}
      <div className="flex-1 flex flex-col justify-end p-6 gap-6">
        {explanation && (
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 pointer-events-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[50vh]">
             <div className="flex items-start justify-between mb-4 sticky top-0 bg-black/20 backdrop-blur-sm py-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scientific Breakdown</h3>
                <button onClick={() => setExplanation(null)} className="text-white/40 hover:text-white">&times;</button>
             </div>
             <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-line">
                {explanation}
             </p>
          </div>
        )}

        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter">
            <span style={{ color: config.color }} className="transition-colors duration-500 uppercase">{config.animationStyle}</span> <span className="text-white/40">SYSTEM</span>
          </h2>
          <p className="text-lg text-white/50 font-light leading-relaxed">
            Exploring the intersection of <code className="bg-white/10 px-1.5 py-0.5 rounded text-white text-sm">math</code> and <code className="bg-white/10 px-1.5 py-0.5 rounded text-white text-sm">aesthetics</code>.
            This module currently executes a dynamic {config.animationStyle} algorithm rendering at 60fps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
