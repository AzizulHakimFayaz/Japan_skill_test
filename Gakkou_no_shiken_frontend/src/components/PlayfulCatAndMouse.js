'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function PlayfulCatAndMouse() {
  const canvasRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // --- Pawprint and Dust Particles ---
    const particles = [];

    const addDust = (x, y, color = 'rgba(200, 200, 200, 0.4)', size = 4) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        alpha: 0.7,
        size,
        color,
        type: 'dust',
      });
    };

    const addPaw = (x, y, angle, isCat = true) => {
      particles.push({
        x,
        y,
        angle,
        alpha: 0.55,
        size: isCat ? 4 : 2,
        color: isCat ? 'rgba(244, 63, 94, 0.4)' : 'rgba(100, 116, 139, 0.35)',
        type: 'paw',
      });
    };

    // --- 1. The Clever Mouse (ネズミ) ---
    const mouse = {
      x: width * 0.7,
      y: height * 0.5,
      vx: 0,
      vy: 0,
      speed: 4.8,
      maxSpeed: 7.2,
      angle: 0,
      targetX: width * 0.3,
      targetY: height * 0.3,
      changeTargetTimer: 0,
      size: 14,
      stepPhase: 0,
      scared: false,
    };

    // --- 2. The Agile Japanese Cat (ネコ) ---
    const cat = {
      x: width * 0.2,
      y: height * 0.6,
      vx: 0,
      vy: 0,
      speed: 4.2,
      maxSpeed: 6.8,
      angle: 0,
      size: 26,
      stepPhase: 0,
      pouncing: false,
      skidding: false,
      pawTimer: 0,
    };

    // --- Mouse AI Update ---
    const updateMouse = () => {
      mouse.changeTargetTimer--;

      // Check distance to cat
      const dxCat = mouse.x - cat.x;
      const dyCat = mouse.y - cat.y;
      const distToCat = Math.hypot(dxCat, dyCat);

      // If cat is too close, panic and sprint away!
      if (distToCat < 200) {
        mouse.scared = true;
        // Escape angle directly opposite to cat + small zig-zag
        const escapeAngle = Math.atan2(dyCat, dxCat) + (Math.random() - 0.5) * 0.6;
        mouse.targetX = mouse.x + Math.cos(escapeAngle) * 350;
        mouse.targetY = mouse.y + Math.sin(escapeAngle) * 350;
        mouse.speed = mouse.maxSpeed;
      } else {
        mouse.scared = false;
        mouse.speed = 3.6;

        // Pick new random waypoint on screen
        if (mouse.changeTargetTimer <= 0) {
          const margin = 80;
          mouse.targetX = margin + Math.random() * (width - margin * 2);
          mouse.targetY = margin + Math.random() * (height - margin * 2);
          mouse.changeTargetTimer = Math.floor(Math.random() * 120 + 80);
        }
      }

      // Bound target within viewport
      mouse.targetX = Math.max(50, Math.min(width - 50, mouse.targetX));
      mouse.targetY = Math.max(50, Math.min(height - 50, mouse.targetY));

      // Move toward target
      const dx = mouse.targetX - mouse.x;
      const dy = mouse.targetY - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 10) {
        const targetAngle = Math.atan2(dy, dx);
        // Smooth rotation
        let angleDiff = targetAngle - mouse.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        mouse.angle += angleDiff * 0.15;

        mouse.vx = Math.cos(mouse.angle) * mouse.speed;
        mouse.vy = Math.sin(mouse.angle) * mouse.speed;
      } else {
        mouse.changeTargetTimer = 0;
      }

      mouse.x += mouse.vx;
      mouse.y += mouse.vy;
      mouse.stepPhase += 0.4;

      // Screen wrap / bounce boundaries
      if (mouse.x < 30) { mouse.x = 30; mouse.targetX = width - 100; }
      if (mouse.x > width - 30) { mouse.x = width - 30; mouse.targetX = 100; }
      if (mouse.y < 30) { mouse.y = 30; mouse.targetY = height - 100; }
      if (mouse.y > height - 30) { mouse.y = height - 30; mouse.targetY = 100; }

      if (Math.random() < 0.2) {
        addPaw(mouse.x, mouse.y, mouse.angle, false);
      }
    };

    // --- Cat AI Update ---
    const updateCat = () => {
      // Cat targets slightly ahead of mouse (intercept prediction)
      const targetX = mouse.x + mouse.vx * 12;
      const targetY = mouse.y + mouse.vy * 12;

      const dx = targetX - cat.x;
      const dy = targetY - cat.y;
      const dist = Math.hypot(dx, dy);

      // Pounce sprint when in strike distance!
      if (dist < 130 && dist > 40) {
        cat.pouncing = true;
        cat.speed = cat.maxSpeed;
      } else {
        cat.pouncing = false;
        cat.speed = 4.4;
      }

      // Close call near-catch! If very close, mouse dodges wildly
      if (dist < 38) {
        cat.skidding = true;
        addDust(cat.x, cat.y, 'rgba(239, 68, 68, 0.4)', 6);
        mouse.targetX = Math.random() * width;
        mouse.targetY = Math.random() * height;
        mouse.changeTargetTimer = 40;
      } else {
        cat.skidding = false;
      }

      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - cat.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      cat.angle += angleDiff * 0.12;

      cat.vx = Math.cos(cat.angle) * cat.speed;
      cat.vy = Math.sin(cat.angle) * cat.speed;

      cat.x += cat.vx;
      cat.y += cat.vy;
      cat.stepPhase += 0.35;

      cat.pawTimer++;
      if (cat.pawTimer % 6 === 0) {
        addPaw(cat.x - Math.cos(cat.angle) * 10, cat.y - Math.sin(cat.angle) * 10, cat.angle, true);
        addDust(cat.x, cat.y, 'rgba(200, 200, 200, 0.3)', 3);
      }
    };

    // --- Draw Mouse (ネズミ) ---
    const drawMouse = () => {
      ctx.save();
      ctx.translate(mouse.x, mouse.y);
      ctx.rotate(mouse.angle);

      const legOffset = Math.sin(mouse.stepPhase) * 3;

      // Mouse Tail
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-18, Math.sin(mouse.stepPhase) * 6, -26, Math.cos(mouse.stepPhase) * 4);
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Mouse Feet
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(-4, 7 + legOffset, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.ellipse(-4, -7 - legOffset, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.ellipse(6, 6 - legOffset, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.ellipse(6, -6 + legOffset, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouse Body (Grey / Slate Fur)
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();

      // Mouse Head
      ctx.beginPath();
      ctx.moveTo(6, -5);
      ctx.lineTo(15, 0);
      ctx.lineTo(6, 5);
      ctx.closePath();
      ctx.fillStyle = '#64748b';
      ctx.fill();

      // Pink Nose
      ctx.beginPath();
      ctx.arc(15, 0, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();

      // Mouse Ears (Pink inside)
      ctx.beginPath();
      ctx.arc(4, -6, 4, 0, Math.PI * 2);
      ctx.arc(4, 6, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(4, -6, 2.2, 0, Math.PI * 2);
      ctx.arc(4, 6, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#fbcfe8';
      ctx.fill();

      // Eyes
      ctx.beginPath();
      ctx.arc(8, -3, 1.3, 0, Math.PI * 2);
      ctx.arc(8, 3, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Panic Sweats / Whiskers if scared
      if (mouse.scared) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(14, -8, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // --- Draw Cat (日本の可愛い猫 / Calico & Japanese Red Ribbon) ---
    const drawCat = () => {
      ctx.save();
      ctx.translate(cat.x, cat.y);
      ctx.rotate(cat.angle);

      const legCycle = Math.sin(cat.stepPhase) * 6;

      // Cat Swishing Tail
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.bezierCurveTo(-26, Math.sin(cat.stepPhase * 0.8) * 12, -34, -Math.cos(cat.stepPhase * 0.8) * 14, -38, -6);
      ctx.strokeStyle = '#dc2626'; // Red tail tip
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Cat Paws / Legs (Galloping)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      // Back Legs
      ctx.ellipse(-10, 11 + legCycle, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(-10, -11 - legCycle, 4.5, 3, 0, 0, Math.PI * 2);
      // Front Legs
      ctx.ellipse(10, 10 - legCycle, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(10, -10 + legCycle, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cat Body (Warm Calico / White & Orange-Red patches)
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      // Calico Patch on Back
      ctx.beginPath();
      ctx.ellipse(-4, -3, 8, 6, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316'; // Orange spot
      ctx.fill();

      // Red Japanese Collar Ribbon with Gold Bell
      ctx.beginPath();
      ctx.rect(9, -8, 3.5, 16);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // Gold Bell
      ctx.beginPath();
      ctx.arc(11, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();

      // Cat Head
      ctx.beginPath();
      ctx.ellipse(14, 0, 10, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Cat Ears (Pointy Japanese Neko Ears)
      ctx.beginPath();
      // Left Ear
      ctx.moveTo(11, -8);
      ctx.lineTo(17, -17);
      ctx.lineTo(20, -7);
      ctx.closePath();
      ctx.fillStyle = '#f97316';
      ctx.fill();
      // Left Ear Pink Interior
      ctx.beginPath();
      ctx.moveTo(13, -8);
      ctx.lineTo(17, -14);
      ctx.lineTo(19, -8);
      ctx.closePath();
      ctx.fillStyle = '#fda4af';
      ctx.fill();

      // Right Ear
      ctx.beginPath();
      ctx.moveTo(11, 8);
      ctx.lineTo(17, 17);
      ctx.lineTo(20, 7);
      ctx.closePath();
      ctx.fillStyle = '#1e293b'; // Black calico ear
      ctx.fill();
      // Right Ear Pink Interior
      ctx.beginPath();
      ctx.moveTo(13, 8);
      ctx.lineTo(17, 14);
      ctx.lineTo(19, 8);
      ctx.closePath();
      ctx.fillStyle = '#fda4af';
      ctx.fill();

      // Cat Eyes (Focused hunting eyes)
      ctx.beginPath();
      ctx.ellipse(18, -4, 2.2, 3, 0.2, 0, Math.PI * 2);
      ctx.ellipse(18, 4, 2.2, 3, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981'; // Emerald Green Cat Eyes
      ctx.fill();

      // Slit Pupils
      ctx.beginPath();
      ctx.ellipse(18.5, -4, 0.8, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(18.5, 4, 0.8, 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#022c22';
      ctx.fill();

      // Pink Cute Nose
      ctx.beginPath();
      ctx.moveTo(22, -1.5);
      ctx.lineTo(24, 0);
      ctx.lineTo(22, 1.5);
      ctx.closePath();
      ctx.fillStyle = '#f43f5e';
      ctx.fill();

      // Whiskers
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      // Top Whiskers
      ctx.beginPath();
      ctx.moveTo(20, -3);
      ctx.lineTo(28, -7);
      ctx.moveTo(20, -1);
      ctx.lineTo(29, -2);
      // Bottom Whiskers
      ctx.moveTo(20, 3);
      ctx.lineTo(28, 7);
      ctx.moveTo(20, 1);
      ctx.lineTo(29, 2);
      ctx.stroke();

      // Pounce speed lines if pouncing
      if (cat.pouncing) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-20, -8);
        ctx.lineTo(-35, -12);
        ctx.moveTo(-20, 8);
        ctx.lineTo(-35, 12);
        ctx.stroke();
      }

      ctx.restore();
    };

    // --- Main Game Animation Loop ---
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and Draw Paw Prints & Dust
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= 0.008;

        if (p.type === 'dust') {
          p.x += p.vx;
          p.y += p.vy;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'paw') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.arc(p.size * 1.2, -p.size * 0.7, p.size * 0.45, 0, Math.PI * 2);
          ctx.arc(p.size * 1.5, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.arc(p.size * 1.2, p.size * 0.7, p.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // 2. Update Cat & Mouse
      updateMouse();
      updateCat();

      // 3. Draw Characters
      drawMouse();
      drawCat();

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-30 w-full h-full"
        />
      )}

      {/* Discrete Floating Play/Pause Cat Toggle */}
      <button
        onClick={() => setEnabled(!enabled)}
        title={enabled ? 'Hide Cat & Mouse Animation' : 'Show Cat & Mouse Animation'}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-black cursor-pointer group"
      >
        <span className="text-base group-hover:scale-125 transition-transform">🐱</span>
        <span className="text-[10px] hidden sm:inline-block font-extrabold pr-1">
          {enabled ? 'Hide Neko' : 'Play Neko'}
        </span>
      </button>
    </>
  );
}
