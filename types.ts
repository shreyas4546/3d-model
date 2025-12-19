
export type AnimationStyle = 'plexus' | 'flow' | 'matrix' | 'boids' | 'stars' | 'dna' | 'lattice';

export interface AnimationConfig {
  particleCount: number;
  connectionDistance: number;
  speed: number;
  color: string;
  glowSize: number;
  lineWidth: number;
  matrixRain: boolean;
  themeName: string;
  animationStyle: AnimationStyle;
  tilt: number;
}

export interface Particle {
  x: number;
  y: number;
  z: number;      // 3D coordinate
  ox: number;     // Original/Base X
  oy: number;     // Original/Base Y
  oz: number;     // Original/Base Z
  vx: number;
  vy: number;
  vz: number;     // Velocity in Z
  size: number;
  angle?: number;
}

export interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}
