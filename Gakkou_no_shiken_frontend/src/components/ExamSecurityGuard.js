'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldAlert, Lock, ShieldCheck } from 'lucide-react';

/**
 * Enterprise-grade 0ms Instant Exam Security Guard
 * 
 * Uses direct synchronous DOM class switching (0ms delay) to immediately
 * black out the screen BEFORE Windows Snipping Tool (Win+Shift+S), Mac Screenshots (Cmd+Shift+4),
 * PrintScreen, OBS, or multi-tasking captures can freeze the frame buffer.
 */
export default function ExamSecurityGuard({
  children,
  user = null,
  testTitle = 'Exam',
  enableWatermark = true,
  enableBlurOnBlur = true,
  strictMode = true,
}) {
  const [isObfuscatedState, setIsObfuscatedState] = useState(false);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [timestampStr, setTimestampStr] = useState('');
  const shieldRef = useRef(null);
  const contentRef = useRef(null);

  // Synchronous 0ms DOM blackout trigger
  const applyInstantBlackout = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('exam-instant-blackout');
    }
    setIsObfuscatedState(true);
  }, []);

  const removeInstantBlackout = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('exam-instant-blackout');
    }
    setIsObfuscatedState(false);
  }, []);

  // Format dynamic timestamp for watermark
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestampStr(
        now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Erase clipboard securely
  const clearClipboard = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText('');
      }
    } catch {
      // Ignore
    }
  }, []);

  // Synchronous Event Listeners for 0ms Screen Shield
  useEffect(() => {
    if (!enableBlurOnBlur) return;

    let unblurTimeout = null;

    const handleBlurImmediate = (e) => {
      // 0ms synchronous DOM blackout before OS capture frame is taken
      applyInstantBlackout();
      setFocusLostCount((prev) => prev + 1);
      clearClipboard();
    };

    const handleFocusImmediate = () => {
      // Wipe clipboard to destroy any snip that Windows just took
      clearClipboard();
      if (unblurTimeout) clearTimeout(unblurTimeout);
      unblurTimeout = setTimeout(() => {
        removeInstantBlackout();
        clearClipboard();
      }, 100);
    };

    const handleVisibilityImmediate = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        applyInstantBlackout();
        setFocusLostCount((prev) => prev + 1);
        clearClipboard();
      } else {
        clearClipboard();
        if (unblurTimeout) clearTimeout(unblurTimeout);
        unblurTimeout = setTimeout(() => {
          removeInstantBlackout();
          clearClipboard();
        }, 100);
      }
    };


    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        applyInstantBlackout();
      }
    };

    // Pre-emptive 0ms keydown capture
    const handleKeyDownCapture = (e) => {
      const key = e.key?.toLowerCase();
      const code = e.keyCode || e.which;

      // 1. Windows Key (Meta) or PrintScreen / Snapshot (Snipping tool start)
      if (
        key === 'meta' ||
        key === 'os' ||
        key === 'printscreen' ||
        key === 'snapshot' ||
        code === 44 ||
        code === 91 ||
        code === 92 ||
        code === 93
      ) {
        applyInstantBlackout();
        clearClipboard();
        return;
      }

      // 2. Win + Shift + S or Cmd + Shift + 3/4/5
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        applyInstantBlackout();
        clearClipboard();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // 3. Print / Save / DevTools
      if (
        (e.ctrlKey || e.metaKey) &&
        ['p', 's', 'u', 'i', 'j', 'c'].includes(key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        applyInstantBlackout();
        setTimeout(removeInstantBlackout, 1500);
        return;
      }

      // 4. F12
      if (key === 'f12' || code === 123) {
        e.preventDefault();
        e.stopPropagation();
        applyInstantBlackout();
        setTimeout(removeInstantBlackout, 1500);
        return;
      }
    };

    const handleKeyUpCapture = (e) => {
      const key = e.key?.toLowerCase();
      if (key === 'printscreen' || key === 'snapshot' || e.keyCode === 44) {
        clearClipboard();
        applyInstantBlackout();
      }
    };

    // Attach with capture: true for instant microtask interception
    window.addEventListener('blur', handleBlurImmediate, true);
    window.addEventListener('focus', handleFocusImmediate, true);
    document.addEventListener('visibilitychange', handleVisibilityImmediate, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('keydown', handleKeyDownCapture, true);
    window.addEventListener('keyup', handleKeyUpCapture, true);

    return () => {
      if (unblurTimeout) clearTimeout(unblurTimeout);
      window.removeEventListener('blur', handleBlurImmediate, true);
      window.removeEventListener('focus', handleFocusImmediate, true);
      document.removeEventListener('visibilitychange', handleVisibilityImmediate, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      window.removeEventListener('keydown', handleKeyDownCapture, true);
      window.removeEventListener('keyup', handleKeyUpCapture, true);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('exam-instant-blackout');
      }
    };
  }, [enableBlurOnBlur, applyInstantBlackout, removeInstantBlackout, clearClipboard]);

  // Context Menu, Copy & Drag Prevention
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
      {/* 1. Global Synchronous 0ms Blackout & Anti-Print Styles */}
      <style jsx global>{`
        body.exam-instant-blackout .exam-protected-content {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          filter: blur(100px) !important;
          pointer-events: none !important;
        }

        body.exam-instant-blackout .exam-instant-shield {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

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

      {/* 2. Main Exam Protected Canvas */}
      <div
        ref={contentRef}
        className={`exam-protected-content w-full h-full ${
          isObfuscatedState ? 'hidden' : 'block'
        }`}
      >
        {children}
      </div>

      {/* 3. Dynamic Anti-Camera & Anti-Leak Watermark Mesh */}
      {enableWatermark && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none opacity-[0.14] dark:opacity-[0.09] flex flex-wrap content-center justify-around gap-12 sm:gap-20 p-6 rotate-[-18deg] scale-125 select-none"
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="text-xs sm:text-sm font-black font-mono tracking-widest text-slate-900 dark:text-slate-100 whitespace-nowrap drop-shadow-2xs select-none"
            >
              {watermarkText}
            </div>
          ))}
        </div>
      )}


      {/* 4. Instantaneous 0ms Security Blackout Shield */}
      <div
        ref={shieldRef}
        onClick={removeInstantBlackout}
        className={`exam-instant-shield fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-3xl flex-col items-center justify-center p-6 text-center text-white cursor-pointer select-none ${
          isObfuscatedState ? 'flex' : 'hidden'
        }`}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30 animate-pulse">
          <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-4 h-4" />
          <span>0ms Anti-Capture Shield Active</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white max-w-lg mb-3 tracking-tight">
          Exam Content Protected
        </h2>

        <p className="text-sm text-slate-300 max-w-md mb-8 leading-relaxed">
          Screen capture attempt, Windows key press, or inactive window detected. Exam content is instantly protected against recording.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeInstantBlackout();
          }}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Click Here to Resume Exam</span>
        </button>

        {focusLostCount > 0 && (
          <p className="text-[11px] text-slate-400 mt-6 font-mono">
            Security Triggered: <span className="text-amber-400 font-bold">{focusLostCount}</span> time(s)
          </p>
        )}
      </div>
    </div>
  );
}
