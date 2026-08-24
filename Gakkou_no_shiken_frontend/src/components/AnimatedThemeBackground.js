'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';

export default function AnimatedThemeBackground() {
  const { theme, mounted } = useTheme();
  const canvasRef = useRef(null);
  const isDark = mounted && theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for gentle interaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
      active: false,
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // =========================================================================
    // 1. LUMINESCENT JAPANESE ORIGAMI CRANES (折り紙の鶴 - Orizuru)
    // =========================================================================
    class OrigamiCrane {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = initial ? Math.random() * width : -80;
        this.y = Math.random() * (height * 0.7) + 40;
        this.size = Math.random() * 12 + 16; // 16 to 28px
        this.speedX = Math.random() * 0.7 + 0.45; // Gentle horizontal glide
        this.speedY = Math.sin(Math.random() * Math.PI) * 0.2;
        this.flapPhase = Math.random() * Math.PI * 2;
        this.flapSpeed = Math.random() * 0.04 + 0.03;
        this.tilt = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.35 + 0.4;
      }

      update() {
        this.x += this.speedX;
        this.y += Math.sin(this.flapPhase * 0.5) * 0.35;
        this.flapPhase += this.flapSpeed;

        if (this.x > width + 100) {
          this.reset(false);
        }
      }

      draw(isDarkMode) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tilt);

        const wingFlap = Math.sin(this.flapPhase);
        const s = this.size;

        ctx.lineWidth = 1.2;
        if (isDarkMode) {
          ctx.strokeStyle = `rgba(254, 205, 211, ${this.opacity * 0.8})`;
          ctx.fillStyle = `rgba(244, 63, 94, ${this.opacity * 0.15})`;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = `rgba(225, 29, 72, ${this.opacity * 0.6})`;
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.4})`;
          ctx.shadowColor = 'rgba(244, 114, 182, 0.2)';
          ctx.shadowBlur = 4;
        }

        // Geometric Origami Crane Silhouette Path
        ctx.beginPath();
        // Body triangle
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.6, -s * 0.2); // Neck
        ctx.lineTo(s * 0.8, -s * 0.45); // Head / Beak
        ctx.lineTo(s * 0.5, -s * 0.1);
        ctx.lineTo(-s * 0.7, s * 0.2); // Tail
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-s * 0.2, -s * 0.9 * wingFlap);
        ctx.lineTo(s * 0.4, -s * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-s * 0.15, s * 0.7 * wingFlap);
        ctx.lineTo(s * 0.35, s * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }

    // =========================================================================
    // 2. BIOLUMINESCENT HOTARU FIREFLIES (蛍)
    // =========================================================================
    class HotaruFirefly {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 1.2;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.02;
        this.baseGlow = Math.random() * 0.4 + 0.4;
      }

      update() {
        this.x += this.vx + Math.sin(this.pulsePhase) * 0.3;
        this.y += this.vy + Math.cos(this.pulsePhase * 0.7) * 0.3;
        this.pulsePhase += this.pulseSpeed;

        // Gentle cursor attraction
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius * 1.5 && dist > 20) {
            this.x += (dx / dist) * 0.4;
            this.y += (dy / dist) * 0.4;
          }
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(isDarkMode) {
        const glow = Math.sin(this.pulsePhase) * 0.35 + 0.65;
        const currentAlpha = this.baseGlow * glow;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);

        if (isDarkMode) {
          const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.5);
          grad.addColorStop(0, `rgba(254, 240, 138, ${currentAlpha})`);
          grad.addColorStop(0.4, `rgba(234, 179, 8, ${currentAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(245, 158, 11, ${currentAlpha * 0.4})`;
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // =========================================================================
    // 3. ORGANIC DRIFTING SAKURA PETALS (桜の花びら)
    // =========================================================================
    class SakuraPetal {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -25;
        this.size = Math.random() * 7 + 6;
        this.speedX = Math.random() * 1.2 + 0.6;
        this.speedY = Math.random() * 1.1 + 0.7;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.6;
        this.flip = Math.random() * 360;
        this.flipSpeed = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.4 + 0.4;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 4;
            this.y += (dy / dist) * force * 4;
          }
        }

        if (this.y > height + 30 || this.x > width + 30) {
          this.reset(false);
        }
      }

      draw(isDarkMode) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(Math.cos((this.flip * Math.PI) / 180), 1);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
        ctx.closePath();

        if (isDarkMode) {
          const grad = ctx.createLinearGradient(0, 0, 0, this.size);
          grad.addColorStop(0, `rgba(255, 140, 180, ${this.opacity * 0.9})`);
          grad.addColorStop(1, `rgba(220, 38, 38, ${this.opacity * 0.6})`);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.5)';
          ctx.shadowBlur = 6;
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, this.size);
          grad.addColorStop(0, `rgba(255, 192, 203, ${this.opacity * 0.8})`);
          grad.addColorStop(1, `rgba(244, 114, 182, ${this.opacity * 0.55})`);
          ctx.fillStyle = grad;
        }

        ctx.fill();
        ctx.restore();
      }
    }

    // =========================================================================
    // 4. TWINKLING CELESTIAL STARS & SHOOTING METEORS (夜空の星と流星)
    // =========================================================================
    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * (height * 0.85);
        this.size = Math.random() * 1.5 + 0.4;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.025 + 0.01;
        this.dir = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.alpha += this.twinkleSpeed * this.dir;
        if (this.alpha > 0.9) this.dir = -1;
        if (this.alpha < 0.2) this.dir = 1;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowColor = 'rgba(224, 231, 255, 0.7)';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.restore();
      }
    }

    // Instantiate Element Pools
    let cranes = [];
    let hotaru = [];
    let petals = [];
    let stars = [];

    const initElements = () => {
      const isMobile = width < 768;
      cranes = Array.from({ length: isMobile ? 3 : 5 }, () => new OrigamiCrane());
      hotaru = Array.from({ length: isMobile ? 12 : 24 }, () => new HotaruFirefly());
      petals = Array.from({ length: isMobile ? 18 : 35 }, () => new SakuraPetal());
      stars = Array.from({ length: isMobile ? 35 : 70 }, () => new Star());
    };

    initElements();

    let auroraPhase = 0;

    // --- Main Rendering Loop ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      auroraPhase += 0.006;

      const isCurrentDark = document.documentElement.classList.contains('dark');

      if (isCurrentDark) {
        // Subtle Aurora Waveform
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.75);
        for (let x = 0; x <= width; x += 40) {
          const y = height * 0.65 + Math.sin(x * 0.002 + auroraPhase) * 45;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, height * 0.5, width, height);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
        grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0.03)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Stars
        for (let i = 0; i < stars.length; i++) {
          stars[i].update();
          stars[i].draw();
        }

        // Fireflies
        for (let i = 0; i < hotaru.length; i++) {
          hotaru[i].update();
          hotaru[i].draw(true);
        }
      }

      // Origami Cranes (Both Modes)
      for (let i = 0; i < cranes.length; i++) {
        cranes[i].update();
        cranes[i].draw(isCurrentDark);
      }

      // Sakura Petals (Both Modes)
      for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw(isCurrentDark);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        render();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700">
      {/* Light Mode Clean Canvas Background */}
      <div className="absolute inset-0 bg-[#f8fafc] bg-grid-mesh dark:hidden block transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/30 via-transparent to-slate-100/50 pointer-events-none"></div>
      </div>

      {/* Dark Mode Celestial Night Canvas Background */}
      <div className="absolute inset-0 bg-[#060913] hidden dark:block transition-opacity duration-700">
        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        {/* Ambient Glowing Nebula Glows */}
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-indigo-600/18 via-purple-600/12 to-transparent blur-[120px] pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-[35rem] h-[35rem] rounded-full bg-gradient-to-bl from-japan-red/18 via-rose-600/10 to-transparent blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-cyan-500/10 via-emerald-500/08 to-transparent blur-[140px] pointer-events-none"></div>
      </div>

      {/* High-Performance 60FPS Ambient Japanese Visual Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
    </div>
  );
}
