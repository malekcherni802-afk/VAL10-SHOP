/**
 * VALIO Lenis Smooth Scroll
 * Wraps Lenis initialization with GSAP ScrollTrigger sync
 */

let lenisInstance = null;

export async function initLenis(options = {}) {
  if (typeof window === 'undefined') return null;
  if (lenisInstance) return lenisInstance;

  try {
    const Lenis = (await import('@studio-freight/lenis')).default;

    const lenis = new Lenis({
      duration: options.duration || 1.4,
      easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Sync with GSAP ScrollTrigger if available
    try {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      lenis.on('scroll', ScrollTrigger.update);
    } catch {
      // ScrollTrigger not available, skip sync
    }

    // RAF loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenisInstance = lenis;
    return lenis;
  } catch (e) {
    console.warn('Lenis failed to initialize:', e);
    return null;
  }
}

export function destroyLenis() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function getLenis() {
  return lenisInstance;
}

export function scrollTo(target, options = {}) {
  if (!lenisInstance) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  lenisInstance.scrollTo(target, {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    ...options,
  });
}
