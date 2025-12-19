import React, { useEffect, useRef, useCallback } from 'react';
import { AnimationConfig, Particle, MatrixColumn } from '../types.ts';
import { MATRIX_CHARS } from '../constants.ts';

interface Props {
  config: AnimationConfig;
}

const CodeRushBackground: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const matrixColumns = useRef<MatrixColumn[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const smoothedMouse = useRef({ x: 0, y: 0 });

  const initParticles = useCallback((width: number, height: number) => {
    particles.current = Array.from({ length: config.particleCount }, (_, i) => {
      let x = (Math.random() - 0.5) * width * 1.5;
      let y = (Math.random() - 0.5) * height * 1.5;
      let z = (Math.random() - 0.5) * 1000;

      if (config.animationStyle === 'dna') {
        const t = (i / config.particleCount) * Math.PI * 4;
        const radius = 150;
        const side = i % 2 === 0 ? 1 : -1;
        x = Math.cos(t * side) * radius;
        y = (i / config.particleCount - 0.5) * height * 0.8;
        z = Math.sin(t * side) * radius;
      } 
      else if (config.animationStyle === 'lattice') {
        const sideCount = Math.ceil(Math.pow(config.particleCount, 1/3));
        const ix = i % sideCount;
        const iy = Math.floor(i / sideCount) % sideCount;
        const iz = Math.floor(i / (sideCount * sideCount));
        const spacing = 120;
        x = (ix - sideCount/2) * spacing;
        y = (iy - sideCount/2) * spacing;
        z = (iz - sideCount/2) * spacing;
      }
      else if (config.animationStyle === 'stars') {
          x = (Math.random() - 0.5) * width * 3;
          y = (Math.random() - 0.5) * height * 3;
          z = Math.random() * 1000;
      }

      return {
        x, y, z,
        ox: x, oy: y, oz: z,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        vz: config.animationStyle === 'stars' ? -config.speed : (Math.random() - 0.5) * config.speed,
        size: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
      };
    });
  }, [config.particleCount, config.speed, config.animationStyle]);

  const initMatrix = useCallback((width: number) => {
    const columns = Math.max(1, Math.floor(width / 20));
    matrixColumns.current = Array.from({ length: columns }, (_, i) => ({
      x: i * 20,
      y: Math.random() * -1000,
      speed: Math.random() * 3 + 1,
      chars: Array.from({ length: 15 }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const focalLength = 800;
    const nearPlane = -400;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
      initMatrix(canvas.width);
    };

    const draw = () => {
      if (config.animationStyle === 'flow') {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Smooth camera interpolation (Inertia/Easing)
      const targetRotationX = (mousePosition.current.y * 0.0008) + (config.tilt || 0);
      const targetRotationY = (mousePosition.current.x * 0.0008);
      rotation.current.x += (targetRotationX - rotation.current.x) * 0.06;
      rotation.current.y += (targetRotationY - rotation.current.y) * 0.06;
      
      smoothedMouse.current.x += (mousePosition.current.x - smoothedMouse.current.x) * 0.1;
      smoothedMouse.current.y += (mousePosition.current.y - smoothedMouse.current.y) * 0.1;

      // Mouse Glow Effect
      const mX = smoothedMouse.current.x + canvas.width / 2;
      const mY = smoothedMouse.current.y + canvas.height / 2;
      const gradient = ctx.createRadialGradient(mX, mY, 0, mX, mY, 150);
      gradient.addColorStop(0, `${config.color}33`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mX, mY, 150, 0, Math.PI * 2);
      ctx.fill();

      // Matrix Rain Effect
      if (config.matrixRain) {
        ctx.shadowBlur = 0;
        ctx.font = '14px "Fira Code"';
        ctx.textAlign = 'center';
        matrixColumns.current.forEach((col) => {
          col.chars.forEach((char, i) => {
            const alpha = Math.max(0, 1 - (i / col.chars.length)) * 0.12;
            ctx.fillStyle = `${config.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillText(char, col.x, col.y - (i * 20));
          });
          col.y += col.speed * (config.speed * 0.8);
          if (col.y > canvas.height + 300) { col.y = -100; col.speed = Math.random() * 3 + 2; }
          if (Math.random() > 0.95) { col.chars.unshift(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]); col.chars.pop(); }
        });
      }

      const projectedParticles: {sx: number, sy: number, size: number, scale: number, alpha: number, p: Particle}[] = [];

      particles.current.forEach((p) => {
        // Physics update
        if (config.animationStyle === 'stars') {
            p.z += p.vz * 2.5;
            if (p.z < nearPlane) p.z = 1000;
        } else {
            // Apply constant velocity
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;

            // Particle attraction to mouse
            const dx = mousePosition.current.x - p.x;
            const dy = mousePosition.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Attraction radius
            const attractionRadius = 500;
            if (dist > 1 && dist < attractionRadius) {
              // Strength decreases linearly with distance
              const force = (1 - dist / attractionRadius) * 1.5;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }

            // Boundary wrapping
            const bounds = 800;
            if (p.x < -bounds) p.x = bounds; if (p.x > bounds) p.x = -bounds;
            if (p.y < -bounds) p.y = bounds; if (p.y > bounds) p.y = -bounds;
            if (p.z < -bounds) p.z = bounds; if (p.z > bounds) p.z = -bounds;
        }

        // Apply 3D Rotations
        let rx = p.x, ry = p.y, rz = p.z;
        
        // Auto-rotation over time
        const time = Date.now() * 0.0003;
        const autoY = time * (config.speed * 0.1);
        
        // Y-axis rotation (Camera + Auto)
        const cosY = Math.cos(autoY + rotation.current.y);
        const sinY = Math.sin(autoY + rotation.current.y);
        const tx = rx * cosY - rz * sinY;
        const tz = rx * sinY + rz * cosY;
        rx = tx; rz = tz;

        // X-axis rotation (Camera Tilt)
        const cosX = Math.cos(rotation.current.x);
        const sinX = Math.sin(rotation.current.x);
        const ty = ry * cosX - rz * sinX;
        const ttz = ry * sinX + rz * cosX;
        ry = ty; rz = ttz;

        // Realistic Perspective Projection
        const zDepth = rz + focalLength;
        if (zDepth > 10) {
          const scale = focalLength / zDepth;
          const sx = rx * scale + canvas.width / 2;
          const sy = ry * scale + canvas.height / 2;

          // Frustum clipping
          if (sx > -100 && sx < canvas.width + 100 && sy > -100 && sy < canvas.height + 100) {
            const alpha = Math.min(1, Math.max(0, 1 - rz / 1000));
            projectedParticles.push({ sx, sy, size: p.size * scale, scale, alpha, p });
          }
        }
      });

      // Render Projected Particles
      projectedParticles.forEach(({ sx, sy, size, scale, alpha }, i) => {
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.1, size), 0, Math.PI * 2);
        const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        
        if (config.glowSize > 0) {
          ctx.shadowBlur = config.glowSize * scale;
          ctx.shadowColor = config.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = `${config.color}${hexAlpha}`;
        ctx.fill();

        // Line rendering for Plexus / Lattice / DNA styles
        if (['plexus', 'dna', 'lattice'].includes(config.animationStyle)) {
            for (let j = i + 1; j < Math.min(i + 12, projectedParticles.length); j++) {
                const p2 = projectedParticles[j];
                const dx = sx - p2.sx;
                const dy = sy - p2.sy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const limit = config.animationStyle === 'plexus' ? config.connectionDistance : 100;

                if (dist < limit) {
                    ctx.beginPath();
                    const lineAlpha = (1 - dist / limit) * alpha * p2.alpha * 0.45;
                    const hexLineAlpha = Math.floor(lineAlpha * 255).toString(16).padStart(2, '0');
                    
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = `${config.color}${hexLineAlpha}`;
                    ctx.lineWidth = Math.max(0.1, config.lineWidth * scale);
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(p2.sx, p2.sy);
                    ctx.stroke();
                }
            }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config, initParticles, initMatrix]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePosition.current = { 
        x: e.clientX - window.innerWidth / 2, 
        y: e.clientY - window.innerHeight / 2 
    };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 w-full h-full pointer-events-auto z-0 cursor-none"
    />
  );
};

export default CodeRushBackground;