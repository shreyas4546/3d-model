
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
      let x = (Math.random() - 0.5) * width;
      let y = (Math.random() - 0.5) * height;
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
        const spacing = 100;
        x = (ix - sideCount/2) * spacing;
        y = (iy - sideCount/2) * spacing;
        z = (iz - sideCount/2) * spacing;
      }
      else if (config.animationStyle === 'stars') {
          x = (Math.random() - 0.5) * width * 2;
          y = (Math.random() - 0.5) * height * 2;
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
    const focalLength = 600;
    const nearPlane = -500;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
      initMatrix(canvas.width);
    };

    const draw = () => {
      if (config.animationStyle === 'flow') {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Smooth camera interpolation (Inertia/Easing)
      const targetRotationX = (mousePosition.current.y * 0.0006) + (config.tilt || 0);
      const targetRotationY = (mousePosition.current.x * 0.0006);
      rotation.current.x += (targetRotationX - rotation.current.x) * 0.08;
      rotation.current.y += (targetRotationY - rotation.current.y) * 0.08;
      
      smoothedMouse.current.x += (mousePosition.current.x - smoothedMouse.current.x) * 0.1;
      smoothedMouse.current.y += (mousePosition.current.y - smoothedMouse.current.y) * 0.1;

      // Matrix Rain Effect
      if (config.matrixRain) {
        ctx.shadowBlur = 0;
        ctx.font = '14px "Fira Code"';
        ctx.textAlign = 'center';
        matrixColumns.current.forEach((col) => {
          col.chars.forEach((char, i) => {
            const alpha = Math.max(0, 1 - (i / col.chars.length)) * 0.15;
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
            // Mouse Interaction Logic (Repulsion)
            // We interact with particles in a simulated 3D space near their position
            const dx = p.x - mousePosition.current.x * 0.5;
            const dy = p.y - mousePosition.current.y * 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const interactionRadius = 20