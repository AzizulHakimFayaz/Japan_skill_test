'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';

/**
 * ZoomableImage Component
 * Displays an image with a clear click-to-zoom indicator, and opens a full-featured
 * lightbox with smooth panning, mouse-wheel zooming, reset, and keyboard controls.
 */
export default function ZoomableImage({
  src,
  alt = 'Question illustration',
  className = '',
  containerClassName = '',
  stopLabelPropagation = false,
  caption = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Handle open modal
  const handleOpen = (e) => {
    if (stopLabelPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle close modal
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom helpers
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.35, 4));
  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.35, 0.75);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard shortcuts (Esc to close, + to zoom in, - to zoom out)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    // Prevent body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Mouse wheel zoom inside modal
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  // Double-click to toggle zoom between 1x and 2x
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > 1.1) {
      resetZoom();
    } else {
      setScale(2);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!src) return null;

  return (
    <>
      {/* Inline Image with Zoom Indicator */}
      <div
        className={`relative inline-block group cursor-zoom-in overflow-hidden rounded ${containerClassName}`}
        onClick={handleOpen}
        title="Click to zoom illustration"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleOpen(e);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
        />

        {/* Hover / Touch Visual Indicator */}
        <div className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white px-2 py-1 rounded-lg backdrop-blur-md text-[11px] font-bold flex items-center gap-1 shadow-md opacity-85 group-hover:opacity-100 transition-opacity border border-white/20 pointer-events-none">
          <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Zoom</span>
        </div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fade-in select-none"
          onClick={handleClose}
        >
          {/* Top Bar: Title & Controls */}
          <div
            className="flex items-center justify-between w-full max-w-5xl mx-auto z-10 gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title / Description */}
            <div className="text-white min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{caption || alt || 'Illustration Viewer'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Double-click or scroll mouse wheel to zoom • Drag to pan when enlarged
              </span>
            </div>

            {/* Controls Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
              <span className="text-[11px] font-mono font-bold text-amber-300 px-2 py-0.5 bg-slate-800 rounded-lg">
                {Math.round(scale * 100)}%
              </span>

              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= 0.75}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Zoom out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={resetZoom}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Reset zoom (0)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= 4}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Zoom in (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-slate-700 mx-1"></div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 sm:p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Zoom & Pan Canvas */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden my-2 relative w-full"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
            style={{
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onDoubleClick={handleDoubleClick}
              draggable={false}
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-lg shadow-2xl transition-transform duration-75 select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>

          {/* Bottom Helpful Hint Bar */}
          <div
            className="w-full text-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs rounded-full shadow-md backdrop-blur-md">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Click outside or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 text-[10px] font-mono border border-slate-700">ESC</kbd> to exit</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
