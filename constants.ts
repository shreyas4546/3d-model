
import { AnimationConfig } from './types';

export const DEFAULT_CONFIG: AnimationConfig = {
  particleCount: 120,
  connectionDistance: 150,
  speed: 1.2,
  color: '#00f2ff',
  glowSize: 15,
  lineWidth: 0.8,
  matrixRain: true,
  themeName: 'Cyberpunk Cyan',
  animationStyle: 'plexus'
};

export const THEMES: Record<string, Partial<AnimationConfig>> = {
  'Hyperspace': { color: '#ffffff', matrixRain: false, animationStyle: 'stars', speed: 5.0, particleCount: 200 },
  'DNA Helix': { color: '#bc13fe', matrixRain: true, animationStyle: 'dna', speed: 1.0, particleCount: 150 },
  '3D Lattice': { color: '#00ff41', matrixRain: false, animationStyle: 'lattice', speed: 0.8, particleCount: 125 },
  'Cyberpunk Cyan': { color: '#00f2ff', matrixRain: true, animationStyle: 'plexus' },
  'Flow Field': { color: '#ff00ff', matrixRain: false, animationStyle: 'flow', particleCount: 150, speed: 2.0 },
  'Matrix Green': { color: '#00ff41', matrixRain: true, animationStyle: 'matrix' },
  'Golden Tech': { color: '#ffcc00', matrixRain: false, animationStyle: 'plexus' }
};

export const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]'.split('');
