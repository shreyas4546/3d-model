
import React, { useState } from 'react';
import { AnimationConfig } from '../types.ts';
import { DEFAULT_CONFIG, THEMES } from '../constants.ts';
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
  const [showExplanation, setShowExplanation] = useState(true);

  const handleGeminiTheme = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const suggestion = await getThemeSuggestion(prompt);
      // The suggestion from Gemini includes 'themeName', which is spread here
      setConfig(prev => ({ ...prev, ...suggestion }));
      setPrompt('');
      setShowExplanation(true);
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
      setShowExplanation(true);
    } catch (err) {
      setError("Could not retrieve explanation.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExplanation = () => {
    if (!explanation) {
      handleExplain();
    } else {
      setShowExplanation(!showExplanation);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setError(null);
    setExplanation(null);
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
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">Famous Presets</label>
            <button 
              onClick={handleReset}
              className="text-[10px] uppercase font-bold text-white/20 hover:text-white/60 transition-colors tracking-tighter"
            >
              Reset to Default
            </button>
          </div>
          <div className="relative">
            <select
              value={config.themeName || ""}
              onChange={(e) => {
                const theme = e.target.value;
                if (THEMES[theme]) {
                  setConfig(prev => ({ ...prev, ...THEMES[theme], themeName: theme }));
                  setError(null);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#111]">Select a Preset</option>
              {Object.keys(THEMES).map(theme => (
                <option key={theme} value={theme} className="bg-[#111]">{theme}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">▼</div>
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
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Active Logic</span>
                <span className="text-white capitalize font-mono text-sm">{config.animationStyle}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-tighter">Matrix Rain</span>
                <button 
                  onClick={() => setConfig(prev => ({ ...prev, matrixRain: !prev.matrixRain }))}
                  className={`w-8 h-4 rounded-full transition-colors relative ${config.matrixRain ? 'bg-white' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${config.matrixRain ? 'right-0.5 bg-black' : 'left-0.5 bg-white/40'}`} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Camera Tilt</span>
                <span>{config.tilt.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="-0.5" max="0.5" step="0.01"
                value={config.tilt} 
                onChange={(e) => setConfig(prev => ({...prev, tilt: parseFloat(e.target.value)}))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
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
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-white/60">
                  <span>Connection Range</span>
                  <span className="ml-2 text-white/80">{config.connectionDistance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 uppercase">Color</span>
                  <input 
                    type="color" 
                    value={config.color} 
                    onChange={(e) => setConfig(prev => ({...prev, color: e.target.value}))}
                    className="w-6 h-6 rounded bg-transparent border-none cursor-pointer outline-none p-0"
                  />
                </div>
              </div>
              <input 
                type="range" min="50" max="300" 
                value={config.connectionDistance} 
                onChange={(e) => setConfig(prev => ({...prev, connectionDistance: parseInt(e.target.value)}))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Line Width</span>
                <span>{config.lineWidth.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.1" max="5.0" step="0.1"
                value={config.lineWidth} 
                onChange={(e) => setConfig(prev => ({...prev, lineWidth: parseFloat(e.target.value)}))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Glow Intensity</span>
                <span>{config.glowSize}</span>
              </div>
              <input 
                type="range" min="0" max="30" 
                value={config.glowSize} 
                onChange={(e) => setConfig(prev => ({...prev, glowSize: parseInt(e.target.value)}))}
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

        <div className="mt-auto flex gap-2">
          <button
            onClick={handleExplain}
            disabled={loading}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white/80 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Analyze'}
          </button>
          <button
            onClick={toggleExplanation}
            className={`px-4 py-3 border rounded-xl transition-all ${showExplanation && explanation ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
            title="Toggle Breakdown View"
          >
            {showExplanation ? '👁' : '✖'}
          </button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="flex-1 flex flex-col justify-end p-6 gap-6">
        {explanation && showExplanation && (
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 pointer-events-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[50vh] relative shadow-2xl">
             <div className="flex items-start justify-between mb-4 sticky top-0 bg-transparent py-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Scientific Breakdown
                </h3>
                <button onClick={() => setShowExplanation(false)} className="text-white/40 hover:text-white transition-colors">&times;</button>
             </div>
             <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-line font-mono">
                {explanation}
             </p>
          </div>
        )}

        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
              Theme: {config.themeName || 'Custom'}
            </span>
          </div>
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
