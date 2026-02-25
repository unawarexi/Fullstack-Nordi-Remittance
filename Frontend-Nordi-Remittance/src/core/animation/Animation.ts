// ========== FRAMER MOTION VARIANTS ==========

// Alias for backward compatibility
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Alias for backward compatibility
export const smoothPopIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
};

// Container Animations (Stagger Children)
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Item Animations (Fade + Slide Up)
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Fade In Animation
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  },
};

// Slide Up Animation
export const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
};

// Slide Down Animation
export const slideDownVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
};

// Scale Animation
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  },
};

// Hover Scale Animation
export const hoverScaleVariants = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3 }
  },
};

// ========== SPINNER ANIMATIONS ==========

// Rotating Spinner Animation
export const rotateAnimation = {
  animate: { rotate: 360 },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

// Counter-Rotating Animation
export const counterRotateAnimation = {
  animate: { rotate: -360 },
  transition: {
    duration: 1.2,
    repeat: Infinity,
    ease: "linear",
  },
};

// Pulse Dots Animation
export const pulseDotAnimation = (index) => ({
  animate: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.5, 1],
  },
  transition: {
    duration: 0.8,
    repeat: Infinity,
    delay: index * 0.15,
    ease: "easeInOut",
  },
});

// Bouncing Bars Animation
export const bouncingBarAnimation = (index) => ({
  animate: {
    scaleY: [1, 1.8, 1],
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    delay: index * 0.1,
    ease: "easeInOut",
  },
});

// Ring Spinner Animation
export const ringSpinAnimation = {
  animate: { rotate: 360 },
  transition: {
    duration: 0.8,
    repeat: Infinity,
    ease: "linear",
  },
};

// ========== TOAST ANIMATIONS ==========

// Toast Entry/Exit Animation
export const toastVariants = {
  initial: { y: -100, opacity: 0, scale: 0.95 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: -100, opacity: 0, scale: 0.95 },
  transition: {
    type: "spring",
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};

// ========== PAGE TRANSITION ANIMATIONS ==========

// Page Fade In
export const pageFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Page Slide In (From Right)
export const pageSlideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.3 },
};

// Page Slide In (From Left)
export const pageSlideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
  transition: { duration: 0.3 },
};

// ========== MODAL ANIMATIONS ==========

// Modal Backdrop
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Modal Content
export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  },
};

// ========== CARD ANIMATIONS ==========

// Card Hover Animation
export const cardHoverAnimation = {
  whileHover: { 
    y: -5,
    transition: { duration: 0.3 }
  },
};

// Card Tap Animation
export const cardTapAnimation = {
  whileTap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// ========== BUTTON ANIMATIONS ==========

// Button Hover Animation
export const buttonHoverAnimation = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// ========== LOADING OVERLAY ANIMATIONS ==========

// Full Page Overlay
export const overlayFadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ========== STAGGER DELAY HELPER ==========
export const staggerDelay = (index, baseDelay = 0.1) => ({
  transition: { delay: index * baseDelay }
});

// ========== LANDING PAGE SPECIFIC ANIMATIONS ==========

// Header Animation (Fade + Slide Down)
export const headerAnimation = {
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

// Content Slide Up Animation
export const contentSlideUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

// Content Slide Up with Delay
export const contentSlideUpWithDelay = (delay = 0.1) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay }
});

// Gallery Image Animation
export const galleryImageAnimation = (index) => ({
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { delay: index * 0.1 }
});

// Gallery Image Hover
export const galleryImageHover = {
  whileHover: { scale: 1.05 }
};

// Pricing Card Animation
export const pricingCardAnimation = (index) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: index * 0.1 }
});

// Pricing Card Hover
export const pricingCardHover = {
  whileHover: { y: -5 }
};

// Team Member Animation
export const teamMemberAnimation = (index) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: index * 0.1 }
});

// Faculty/Course Card Hover
export const cardHover = {
  whileHover: { y: -5 }
};

// Stats/Metrics Scale Animation
export const metricsScaleAnimation = {
  whileHover: { scale: 1.05 }
};

// CTA Section Animation
export const ctaAnimation = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

// Workflow Tab Transition
export const workflowTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
};

// ========== COMBINED ANIMATION PROPS ==========

// For components that need multiple animation props at once
export const getHeaderAnimationProps = () => ({
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
});

export const getContentSlideUpProps = () => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
});

export const getStaggeredItemProps = (index, baseDelay = 0.1) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: index * baseDelay }
});

// ========== DASHBOARD SPECIFIC ANIMATIONS ==========

// Dashboard Container (faster stagger for dense layouts)
export const dashboardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

// Dashboard Item (snappy entry)
export const dashboardItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// Card reveal with index-based stagger delay
export const cardRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

// List item reveal with horizontal slide
export const listItemRevealVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25 },
  }),
};

// Sidebar item (compact & fast)
export const sidebarItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

// Sidebar container
export const sidebarContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};