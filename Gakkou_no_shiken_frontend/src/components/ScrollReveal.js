'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Wrapper Component
 * Smoothly reveals content as it scrolls into the viewport ("coming from nowhere" effect).
 *
 * @param {React.ReactNode} children
 * @param {string} className - Extra Tailwind classes
 * @param {'up' | 'down' | 'left' | 'right' | 'zoom' | 'blur'} variant - Animation style
 * @param {number} delay - Animation delay in ms
 * @param {number} duration - Animation duration in ms
 * @param {number} threshold - Intersection threshold (0 to 1)
 */
export default function ScrollReveal({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  duration = 750,
  threshold = 0.12,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Check if IntersectionObserver is available
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Reveal once
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px', // Trigger slightly before it hits bottom
      }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold]);

  // Initial hidden state styles based on variant
  const getInitialTransform = () => {
    switch (variant) {
      case 'up':
        return 'translate3d(0, 36px, 0) scale(0.96)';
      case 'down':
        return 'translate3d(0, -36px, 0) scale(0.96)';
      case 'left':
        return 'translate3d(-40px, 0, 0) scale(0.96)';
      case 'right':
        return 'translate3d(40px, 0, 0) scale(0.96)';
      case 'zoom':
        return 'translate3d(0, 20px, 0) scale(0.88)';
      case 'blur':
        return 'translate3d(0, 24px, 0) scale(0.95)';
      default:
        return 'translate3d(0, 32px, 0) scale(0.96)';
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : getInitialTransform(),
    filter: isVisible ? 'blur(0px)' : variant === 'blur' ? 'blur(8px)' : 'blur(4px)',
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: 'opacity, transform, filter',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
