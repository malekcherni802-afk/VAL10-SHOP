/**
 * VALIO Animation Utilities
 * Uses GSAP + ScrollTrigger for cinematic effects
 */

let gsapInstance = null;
let ScrollTriggerInstance = null;

export async function getGSAP() {
  if (gsapInstance) return { gsap: gsapInstance, ScrollTrigger: ScrollTriggerInstance };

  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');

  gsap.registerPlugin(ScrollTrigger);
  gsapInstance = gsap;
  ScrollTriggerInstance = ScrollTrigger;

  return { gsap, ScrollTrigger };
}

/**
 * Animate elements in from below on scroll
 */
export async function initScrollReveal(selector = '.scroll-reveal') {
  const { gsap, ScrollTrigger } = await getGSAP();

  const elements = document.querySelectorAll(selector);
  elements.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out',
        delay: (i % 4) * 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
}

/**
 * Stagger reveal a list of elements
 */
export async function staggerReveal(elements, options = {}) {
  const { gsap } = await getGSAP();

  const defaults = {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 },
    ...options,
  };

  gsap.fromTo(elements, defaults.from, defaults.to);
}

/**
 * Magnetic button effect
 */
export function initMagneticButtons(selector = '.magnetic') {
  const buttons = document.querySelectorAll(selector);

  buttons.forEach(btn => {
    const strength = parseFloat(btn.dataset.magnetic) || 0.3;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease';
    });
  });
}

/**
 * Parallax image layers on scroll
 */
export async function initParallax(selector = '.parallax', speed = 0.4) {
  const { gsap, ScrollTrigger } = await getGSAP();

  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    gsap.to(el, {
      yPercent: -20 * speed * 10,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });
}

/**
 * Text char-by-char reveal
 */
export async function revealText(element, options = {}) {
  const { gsap } = await getGSAP();
  if (!element) return;

  const text = element.textContent;
  element.innerHTML = text
    .split('')
    .map(c => `<span style="display:inline-block;opacity:0;transform:translateY(20px)">${c === ' ' ? '&nbsp;' : c}</span>`)
    .join('');

  const chars = element.querySelectorAll('span');
  gsap.to(chars, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.04,
    delay: options.delay || 0,
  });
}

/**
 * Page entrance animation
 */
export async function pageEntrance() {
  const { gsap } = await getGSAP();

  gsap.from('main', {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
  });
}

/**
 * Horizontal marquee scroll
 */
export async function initMarquee(selector = '.marquee-inner') {
  const { gsap } = await getGSAP();

  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    const width = el.scrollWidth / 2;
    gsap.to(el, {
      x: -width,
      duration: 20,
      ease: 'none',
      repeat: -1,
    });
  });
}
