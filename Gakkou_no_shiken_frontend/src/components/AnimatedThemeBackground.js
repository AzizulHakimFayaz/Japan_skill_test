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

    // Mouse interaction coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
      active: false,
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
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

    // --- 1. Realistic 3D Tumbling Sakura Petals (桜の花びら) ---
    class SakuraPetal {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -30;
        this.size = Math.random() * 9 + 7; // 7px to 16px
        this.speedX = Math.random() * 1.5 + 0.8; // Drifting rightwards
        this.speedY = Math.random() * 1.2 + 0.9; // Falling down
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.flip = Math.random() * 360;
        this.flipSpeed = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.45 + 0.45;
        this.colorType = Math.random(); // variation in pink / ruby hues
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        // Interactive mouse repulsion
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 5;
            this.y += (dy / dist) * force * 5;
          }
        }

        if (this.y > height + 40 || this.x > width + 40) {
          this.reset(false);
        }
      }

      draw(isDarkMode) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(Math.cos((this.flip * Math.PI) / 180), 1);

        // Path of a delicate Sakura Petal (Heart-like notched petal)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
        ctx.closePath();

        if (isDarkMode) {
          // Glowing Neon Sakura in Dark Mode
          const grad = ctx.createLinearGradient(0, 0, 0, this.size);
          grad.addColorStop(0, `rgba(255, 120, 160, ${this.opacity * 0.95})`);
          grad.addColorStop(0.7, `rgba(220, 38, 38, ${this.opacity * 0.85})`);
          grad.addColorStop(1, `rgba(180, 20, 80, ${this.opacity * 0.6})`);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
          ctx.shadowBlur = 8;
        } else {
          // Soft Daylight Pink Sakura
          const grad = ctx.createLinearGradient(0, 0, 0, this.size);
          grad.addColorStop(0, `rgba(255, 182, 193, ${this.opacity * 0.85})`);
          grad.addColorStop(1, `rgba(244, 114, 182, ${this.opacity * 0.65})`);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(244, 114, 182, 0.2)';
          ctx.shadowBlur = 3;
        }

        ctx.fill();
        ctx.restore();
      }
    }

    // --- 2. Twinkling Celestial Constellation Stars (夜空の星) ---
    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * (height * 0.85);
        this.size = Math.random() * 1.6 + 0.4;
        this.baseAlpha = Math.random() * 0.5 + 0.3;
        this.alpha = this.baseAlpha;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.alpha += this.twinkleSpeed * this.twinkleDir;
        if (this.alpha > 0.95) {
          this.alpha = 0.95;
          this.twinkleDir = -1;
        } else if (this.alpha < 0.15) {
          this.alpha = 0.15;
          this.twinkleDir = 1;
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowColor = 'rgba(199, 210, 254, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }
    }

    // --- 3. Shooting Meteors / Shooting Stars (流星) ---
    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width * 1.2;
        this.y = Math.random() * (height * 0.4);
        this.length = Math.random() * 140 + 80;
        this.speed = Math.random() * 12 + 10;
        this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2; // approx 45 degrees
        this.active = false;
        this.timer = Math.random() * 250 + 80; // random delay between spawns
        this.opacity = 0;
      }

      update() {
        if (!this.active) {
          this.timer--;
          if (this.timer <= 0) {
            this.active = true;
            this.opacity = 1;
            this.x = Math.random() * (width * 0.9);
            this.y = Math.random() * (height * 0.35);
          }
          return;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.022;

        if (this.opacity <= 0 || this.x > width + 100 || this.y > height + 100) {
          this.reset();
        }
      }

      draw() {
        if (!this.active || this.opacity <= 0) return;
        ctx.save();
        ctx.beginPath();
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, `rgba(254, 240, 138, ${this.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Shooting Star Glowing Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize Particle Arrays
    let petals = [];
    let stars = [];
    let shootingStars = [];

    const initParticles = () => {
      const petalCount = width < 768 ? 22 : 45;
      petals = Array.from({ length: petalCount }, () => new SakuraPetal());

      const starCount = width < 768 ? 40 : 85;
      stars = Array.from({ length: starCount }, () => new Star());

      shootingStars = Array.from({ length: 3 }, () => new ShootingStar());
    };

    initParticles();

    // Aurora Wave Phase
    let auroraPhase = 0;

    // --- Main Render Loop ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      auroraPhase += 0.008;

      const isCurrentDark = document.documentElement.classList.contains('dark');

      if (isCurrentDark) {
        // --- 1. Draw Flowing Neon Aurora Waveforms ---
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Ribbon 1 (Emerald / Cyan Wave)
        ctx.beginPath();
        ctx.moveTo(0, height * 0.75);
        for (let x = 0; x <= width; x += 30) {
          const y =
            height * 0.65 +
            Math.sin(x * 0.002 + auroraPhase) * 60 +
            Math.sin(x * 0.004 + auroraPhase * 1.5) * 30;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const auroraGrad1 = ctx.createLinearGradient(0, height * 0.5, width, height);
        auroraGrad1.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
        auroraGrad1.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        auroraGrad1.addColorStop(1, 'rgba(99, 102, 241, 0.04)');
        ctx.fillStyle = auroraGrad1;
        ctx.fill();

        // Ribbon 2 (Ruby / Indigo Wave)
        ctx.beginPath();
        ctx.moveTo(0, height * 0.55);
        for (let x = 0; x <= width; x += 35) {
          const y =
            height * 0.48 +
            Math.cos(x * 0.0025 + auroraPhase * 0.8) * 50 +
            Math.sin(x * 0.0035 + auroraPhase) * 25;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const auroraGrad2 = ctx.createLinearGradient(0, height * 0.35, width, height * 0.85);
        auroraGrad2.addColorStop(0, 'rgba(220, 38, 38, 0.04)');
        auroraGrad2.addColorStop(0.5, 'rgba(168, 85, 247, 0.07)');
        auroraGrad2.addColorStop(1, 'rgba(59, 130, 246, 0.03)');
        ctx.fillStyle = auroraGrad2;
        ctx.fill();

        ctx.restore();

        // --- 2. Draw Twinkling Stars ---
        for (let i = 0; i < stars.length; i++) {
          stars[i].update();
          stars[i].draw();
        }

        // --- 3. Draw Shooting Meteors ---
        for (let i = 0; i < shootingStars.length; i++) {
          shootingStars[i].update();
          shootingStars[i].draw();
        }

        // --- 4. Interactive Mouse Aura (Follows cursor smoothly) ---
        if (mouse.active) {
          ctx.save();
          const mouseGlow = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            mouse.radius * 1.5
          );
          mouseGlow.addColorStop(0, 'rgba(244, 63, 94, 0.12)');
          mouseGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
          mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = mouseGlow;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }

      // --- 5. Draw Tumbling 3D Sakura Petals (Both Modes) ---
      for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw(isCurrentDark);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Pause rendering when tab is hidden to preserve battery
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
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700">
      {/* Light Mode Clean Canvas Background */}
      <div
        className={`absolute inset-0 bg-[#f8fafc] bg-grid-mesh transition-opacity duration-700 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Soft daylight morning gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-transparent to-slate-100/60 pointer-events-none"></div>
      </div>

      {/* Dark Mode Celestial Night Canvas Background */}
      <div
        className={`absolute inset-0 bg-[#060913] transition-opacity duration-700 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        {/* Ambient Glowing Nebula Blobs */}
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-transparent blur-[120px] pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-[35rem] h-[35rem] rounded-full bg-gradient-to-bl from-japan-red/20 via-rose-600/10 to-transparent blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-cyan-500/10 via-emerald-500/10 to-transparent blur-[140px] pointer-events-none"></div>
      </div>

      {/* High-Performance 60FPS Interactive Canvas (Sakura Petals, Stars, Meteors, Aurora) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
