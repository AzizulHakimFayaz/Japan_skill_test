'use client';

import React from 'react';
import { useTheme } from './ThemeContext';

export default function AnimatedThemeBackground() {
  const { theme, mounted } = useTheme();
  const isDark = mounted && theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700">
      {/* Light Mode Subtle Minimalist Mesh Background */}
      <div
        className={`absolute inset-0 bg-[#f8fafc] bg-grid-mesh transition-opacity duration-700 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Soft daylight ambient gradient top-fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/30 via-transparent to-slate-100/50 pointer-events-none"></div>
      </div>

      {/* Dark Mode Animated Cyber-Nebula & Aurora Canvas */}
      <div
        className={`absolute inset-0 bg-[#060913] transition-opacity duration-700 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        {/* Ambient Glowing Aurora Nebula Orbs (CSS Keyframe Animated) */}
        {/* Orb 1: Indigo Cyber Glow (Top-Left) */}
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-transparent blur-[110px] animate-pulse [animation-duration:8s] pointer-events-none"></div>

        {/* Orb 2: Crimson Sakura Ember Glow (Top-Right) */}
        <div className="absolute -top-20 -right-20 w-[35rem] h-[35rem] rounded-full bg-gradient-to-bl from-japan-red/20 via-rose-600/10 to-transparent blur-[120px] animate-pulse [animation-duration:10s] [animation-delay:2s] pointer-events-none"></div>

        {/* Orb 3: Emerald / Cyan Cyber Aurora (Center-Bottom) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-cyan-500/10 via-emerald-500/10 to-transparent blur-[130px] animate-pulse [animation-duration:12s] [animation-delay:4s] pointer-events-none"></div>

        {/* Floating Glowing Particle Dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-rose-400/60 shadow-[0_0_8px_#f43f5e] animate-ping [animation-duration:4s]"></span>
          <span className="absolute top-[35%] right-[25%] w-1 h-1 rounded-full bg-amber-300/70 shadow-[0_0_6px_#f59e0b] animate-ping [animation-duration:5s] [animation-delay:1s]"></span>
          <span className="absolute top-[60%] left-[15%] w-1.5 h-1.5 rounded-full bg-cyan-400/60 shadow-[0_0_8px_#06b6d4] animate-ping [animation-duration:6s] [animation-delay:2s]"></span>
          <span className="absolute top-[80%] right-[18%] w-1 h-1 rounded-full bg-purple-400/60 shadow-[0_0_6px_#a855f7] animate-ping [animation-duration:4.5s] [animation-delay:3s]"></span>
        </div>

        {/* Deep Horizon Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
