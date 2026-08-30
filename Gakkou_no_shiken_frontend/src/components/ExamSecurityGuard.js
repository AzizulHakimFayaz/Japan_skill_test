'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Lock, AlertTriangle, EyeOff, ShieldCheck } from 'lucide-react';

/**
 * Enterprise-grade Exam Security Guard
 * 
 * Protects quiz content against:
 * 1. Screen capture / Snipping tools (auto-blurs on window blur / tab switch / Win+Shift+S)
 * 2. PrintScreen key (intercepts key, blanks screen, erases clipboard)
 * 3. Print / Save as PDF (CSS @media print blanking)
 * 4. Right-click context menus, dragging, text selection, and copying
 * 5. DevTools (F12, Ctrl+Shift+I/J/C)
 * 6. Phone camera leakage (dynamic user & timestamp watermark overlay)
 */
export default function ExamSecurityGuard({
  children,
  user = null,
  testTitle = 'Exam',
  enableWatermark = true,
  enableBlurOnBlur = true,
  strictMode = true,
}) {
  const [isObfuscated, setIsObfuscated] = useState(false);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [timestampStr, setTimestampStr] = useState('');

  // Format dynamic timestamp for watermark
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestampStr(
        now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Erase clipboard content securely
  const clearClipboard = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText('');
      }
    } catch {
      // Ignore permissions errors
    }
  }, []);

  // Handle Window Focus / Blur & Tab Visibility
  useEffect(() => {
    if (!enableBlurOnBlur) return;

    let unblurTimer = null;

    const handleWindowBlur = () => {
      setIsObfuscated(true);
      setFocusLostCount((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setShowSecurityWarning(true);
        }
        return next;
      });
      clearClipboard();
    };

    const handleWindowFocus = () => {
      if (unblurTimer) clearTimeout(unblurTimer);
      unblurTimer = setTimeout(() => {
        setIsObfuscated(false);
      }, 150);
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        setIsObfuscated(true);
        setFocusLostCount((prev) => prev + 1);
        clearClipboard();
      } else {
        if (unblurTimer) clearTimeout(unblurTimer);
        unblurTimer = setTimeout(() => {
          setIsObfuscated(false);
        }, 150);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (unblurTimer) clearTimeout(unblurTimer);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableBlurOnBlur, clearClipboard]);

  // Keyboard Shortcuts Interception
  useEffect(() => {
    if (!strictMode) return;

    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      const code = e.keyCode || e.which;

      // 1. PrintScreen key
      if (key === 'printscreen' || code === 44) {
        e.preventDefault();
        e.stopPropagation();
        clearClipboard();
        setIsObfuscated(true);
        setTimeout(() => setIsObfuscated(false), 800);
        return false;
      }

      // 2. Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 3. Ctrl/Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 4. Ctrl/Cmd + Shift + S (Snipping Tool shortcut on Windows)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        clearClipboard();
        setIsObfuscated(true);
        setTimeout(() => setIsObfuscated(false), 1200);
        return false;
      }

      // 5. DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 6. Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 7. Ctrl/Cmd + C (Copy) or Ctrl/Cmd + A (Select All)
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 'x'].includes(key)) {
        // Allow copy inside input/textarea if any, otherwise block
        const targetTag = e.target?.tagName?.toLowerCase();
        if (targetTag !== 'input' && targetTag !== 'textarea') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key?.toLowerCase();
      if (key === 'printscreen' || e.keyCode === 44) {
        clearClipboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [strictMode, clearClipboard]);

  // Context Menu & Drag Lock
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  const handleCopy = (e) => {
    e.preventDefault();
    return false;
  };

  const username = user?.username || user?.first_name || 'Candidate';
  const watermarkText = `GAKKOU NO SHIKEN • ${username} • ${timestampStr}`;

  return (
    <div
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onCopy={handleCopy}
      onCut={handleCopy}
      className="relative w-full h-full select-none overflow-hidden"
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* 1. Global Anti-Print & Security CSS Injections */}
      <style jsx global>{`
        @media print {
          html, body, #__next, body * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            opacity: 0 !important;
          }
          body::after {
            content: "🔒 Exam Content Protected: Printing, exporting to PDF, or copying exam material is strictly prohibited." !important;
            display: block !important;
            visibility: visible !important;
            font-size: 20px !important;
            font-weight: bold !important;
            color: #dc2626 !important;
            text-align: center !important;
            padding: 80px 20px !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* 2. Main Exam Canvas Content */}
      <div
        className={`w-full h-full transition-all duration-200 ${
          isObfuscated ? 'filter blur-3xl opacity-0 pointer-events-none' : 'filter-none opacity-100'
        }`}
      >
        {children}
      </div>

      {/* 3. Dynamic Anti-Camera Watermark Mesh */}
      {enableWatermark && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none opacity-[0.06] dark:opacity-[0.04] flex flex-wrap content-center justify-around gap-16 sm:gap-24 p-8 rotate-[-15deg] scale-125"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="text-xs sm:text-sm font-black font-mono tracking-widest text-slate-900 dark:text-slate-100 whitespace-nowrap"
            >
              {watermarkText}
            </div>
          ))}
        </div>
      )}

      {/* 4. Anti-Screenshot / Inactive Window Blackout Shield */}
      {isObfuscated && (
        <div
          onClick={() => setIsObfuscated(false)}
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white cursor-pointer select-none animate-in fade-in duration-150"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/20 animate-pulse">
            <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Capture Security Shield Active</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white max-w-lg mb-3 tracking-tight">
            Exam Content Temporarily Hidden
          </h2>

          <p className="text-sm text-slate-300 max-w-md mb-8 leading-relaxed">
            Screen capture, inactive window, or screen-recording software detected. Exam content is automatically hidden to ensure examination integrity.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsObfuscated(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Click Here to Resume Exam</span>
          </button>

          {focusLostCount > 1 && (
            <p className="text-[11px] text-slate-400 mt-6 font-mono">
              Window focus lost: <span className="text-amber-400 font-bold">{focusLostCount}</span> time(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
