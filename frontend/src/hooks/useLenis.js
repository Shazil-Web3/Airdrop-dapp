import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export const useLenis = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Only initialize if not already initialized
    if (lenisRef.current) return;

    // Initialize Lenis with better settings
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      // Add these settings for better compatibility
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.1,
      touchInertiaMultiplier: 50,
    });

    // RAF loop with better error handling
    function raf(time) {
      if (lenisRef.current) {
        lenisRef.current.raf(time);
      }
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return lenisRef.current;
}; 