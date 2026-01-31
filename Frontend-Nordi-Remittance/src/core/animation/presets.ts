// ============================================================================
// ANIMATION PRESETS - Enhanced Framer Motion animation utilities
// ============================================================================

import { Variants, Transition, TargetAndTransition } from 'framer-motion';

// ========================
// TIMING CONSTANTS
// ========================
export const DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

export const EASINGS = {
  // Standard
  linear: 'linear',
  ease: 'easeInOut',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  
  // Smooth
  smooth: [0.4, 0, 0.2, 1],
  smoothIn: [0.4, 0, 1, 1],
  smoothOut: [0, 0, 0.2, 1],
  
  // Bounce
  bounce: [0.68, -0.55, 0.265, 1.55],
  bounceIn: [0.6, -0.28, 0.735, 0.045],
  bounceOut: [0.175, 0.885, 0.32, 1.275],
  
  // Elastic
  elastic: [0.68, -0.6, 0.32, 1.6],
  
  // Sharp
  sharp: [0.4, 0, 0.6, 1],
  anticipate: [0.38, 0.005, 0.215, 1.09],
} as const;

// ========================
// SPRING CONFIGURATIONS
// ========================
export const SPRINGS = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12 },
  stiff: { type: 'spring', stiffness: 210, damping: 20 },
  slow: { type: 'spring', stiffness: 280, damping: 60 },
  molasses: { type: 'spring', stiffness: 280, damping: 120 },
  default: { type: 'spring', stiffness: 400, damping: 30 },
  snappy: { type: 'spring', stiffness: 500, damping: 25 },
} as const;

// ========================
// FADE VARIANTS
// ========================
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  },
  exit: { 
    opacity: 0,
    transition: { duration: DURATIONS.fast }
  },
};

export const fadeScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: DURATIONS.fast }
  },
};

// ========================
// SLIDE VARIANTS
// ========================
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smoothOut }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: DURATIONS.fast }
  },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smoothOut }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: DURATIONS.fast }
  },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smoothOut }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: DURATIONS.fast }
  },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smoothOut }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: DURATIONS.fast }
  },
};

// ========================
// STAGGER CONTAINERS
// ========================
export const staggerContainerVariants = (staggerDelay = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: staggerDelay / 2,
      staggerDirection: -1,
    },
  },
});

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.smoothOut }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: DURATIONS.fast }
  },
};

// ========================
// PAGE TRANSITIONS
// ========================
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: DURATIONS.normal }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: DURATIONS.slow, ease: EASINGS.smooth }
  },
  
  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth }
  },
};

// ========================
// MODAL VARIANTS
// ========================
export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: DURATIONS.fast }
  },
  exit: { 
    opacity: 0,
    transition: { duration: DURATIONS.fast, delay: 0.1 }
  },
};

export const modalContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: SPRINGS.default
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: DURATIONS.fast }
  },
};

export const modalSlideUpVariants: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: SPRINGS.stiff
  },
  exit: { 
    opacity: 0, 
    y: '100%',
    transition: { duration: DURATIONS.normal, ease: EASINGS.smoothIn }
  },
};

// ========================
// DROPDOWN VARIANTS
// ========================
export const dropdownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: DURATIONS.fast, ease: EASINGS.smoothOut }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    transition: { duration: DURATIONS.instant }
  },
};

// ========================
// TOAST VARIANTS
// ========================
export const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -50, 
    scale: 0.9,
    x: '-50%' 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    x: '-50%',
    transition: SPRINGS.snappy
  },
  exit: { 
    opacity: 0, 
    y: -30, 
    scale: 0.9,
    x: '-50%',
    transition: { duration: DURATIONS.fast }
  },
};

// ========================
// HOVER/TAP ANIMATIONS
// ========================
export const hoverScale = (scale = 1.02): TargetAndTransition => ({
  scale,
  transition: { duration: DURATIONS.fast }
});

export const tapScale = (scale = 0.98): TargetAndTransition => ({
  scale,
  transition: { duration: DURATIONS.instant }
});

export const hoverLift: TargetAndTransition = {
  y: -4,
  boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)',
  transition: { duration: DURATIONS.fast }
};

// ========================
// VIEWPORT ANIMATION HELPERS
// ========================
export const viewportOnce = { once: true, margin: '-50px' };
export const viewportAlways = { once: false, margin: '-50px' };

export const whileInViewSlideUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: viewportOnce,
  transition: { duration: DURATIONS.slow, ease: EASINGS.smoothOut }
};

export const whileInViewFade = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: viewportOnce,
  transition: { duration: DURATIONS.slow }
};

export const whileInViewScale = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: viewportOnce,
  transition: { duration: DURATIONS.slow, ease: EASINGS.smooth }
};

// ========================
// STAGGERED ANIMATION HELPERS
// ========================
export const getStaggeredProps = (index: number, baseDelay = 0.1) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: viewportOnce,
  transition: { duration: DURATIONS.normal, delay: index * baseDelay }
});

export const getStaggeredFadeProps = (index: number, baseDelay = 0.08) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DURATIONS.normal, delay: index * baseDelay }
});

// ========================
// SKELETON/LOADING ANIMATIONS
// ========================
export const shimmerVariants: Variants = {
  initial: { 
    backgroundPosition: '-200% 0'
  },
  animate: { 
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  },
};

export const pulseVariants: Variants = {
  initial: { opacity: 0.6 },
  animate: { 
    opacity: [0.6, 1, 0.6],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut'
    }
  },
};

// ========================
// CARD FLIP ANIMATION
// ========================
export const cardFlipVariants: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

// ========================
// UTILITY FUNCTIONS
// ========================
export const createStaggerVariants = (
  delay = 0.1,
  childDuration = DURATIONS.normal
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: delay / 2,
      staggerDirection: -1,
    },
  },
});

export const createSlideVariants = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance = 20
): Variants => {
  const axes = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const exitAxes = {
    up: { y: -distance / 2 },
    down: { y: distance / 2 },
    left: { x: -distance / 2 },
    right: { x: distance / 2 },
  };

  return {
    hidden: { opacity: 0, ...axes[direction] },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { duration: DURATIONS.normal, ease: EASINGS.smoothOut }
    },
    exit: { 
      opacity: 0, 
      ...exitAxes[direction],
      transition: { duration: DURATIONS.fast }
    },
  };
};

export default {
  DURATIONS,
  EASINGS,
  SPRINGS,
  fadeVariants,
  fadeScaleVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  staggerContainerVariants,
  staggerItemVariants,
  pageTransitions,
  modalOverlayVariants,
  modalContentVariants,
  dropdownVariants,
  toastVariants,
  hoverScale,
  tapScale,
  hoverLift,
};
