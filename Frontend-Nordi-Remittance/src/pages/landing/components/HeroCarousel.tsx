// ============================================================================
// HERO CAROUSEL - Refactored landing page hero section
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/Button';
import Images from '@utils/constants/Image_strings';

// ========================
// SLIDE DATA
// ========================
export interface HeroSlide {
  image: string;
  heading: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    image: Images.carousel6,
    heading: "Invest globally to unlock unlimited opportunities for a prosperous and financially secure future.",
    description: "Expand your horizons with Nordea Remit's global investment options. Designed to secure your financial future, our investment solutions provide you with access to global markets.",
    ctaText: "Start Investing",
  },
  {
    image: Images.carousel4,
    heading: "Elevate your lifestyle with exclusive rewards and unmatched banking services.",
    description: "Experience premium banking services designed for individuals who value sophistication. From concierge services to rewards, enjoy tailored solutions to elevate your financial lifestyle.",
    ctaText: "Learn More",
  },
  {
    image: Images.carousel1,
    heading: "Stay protected with cutting-edge security and theft protection for your peace of mind.",
    description: "Prioritize your financial security with top-tier security and theft protection features. Our robust solutions ensure that your accounts and transactions remain safe.",
    ctaText: "Explore Security",
  },
  {
    image: Images.carousel2,
    heading: "Tailored banking solutions for businesses, empowering growth and innovation.",
    description: "We understand the unique challenges businesses face, which is why we offer industry-specific banking solutions. From startups to large corporations, our tailored services help businesses thrive.",
    ctaText: "Business Banking",
  },
  {
    image: Images.carousel3,
    heading: "Empower your business with flexible loan options for growth and financial stability.",
    description: "We believe in supporting businesses at every stage of their journey. Our flexible loan options provide the financial backing your business needs for expansion or stability.",
    ctaText: "Apply for Loan",
  },
  {
    image: Images.carousel5,
    heading: "Unlock a world of convenience and rewards with our global partner card.",
    description: "Our card offers a world of benefits, providing seamless transactions and exclusive rewards. With worldwide acceptance, it's your perfect companion for personal and business finances.",
    ctaText: "Get Your Card",
  },
];

// ========================
// ANIMATION VARIANTS
// ========================
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' },
  },
};

// ========================
// COMPONENTS
// ========================
export interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
  showArrows?: boolean;
  showPagination?: boolean;
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides = defaultSlides,
  autoPlayInterval = 5000,
  showArrows = true,
  showPagination = true,
  className,
}) => {
  const [[currentIndex, direction], setSlide] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = useCallback((newDirection: number) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex < 0) {
      setSlide([slides.length - 1, newDirection]);
    } else if (newIndex >= slides.length) {
      setSlide([0, newDirection]);
    } else {
      setSlide([newIndex, newDirection]);
    }
  }, [currentIndex, slides.length]);

  const goToSlide = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setSlide([index, newDirection]);
  };

  // Auto-play
  useEffect(() => {
    if (isPaused || autoPlayInterval <= 0) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, paginate]);

  const currentSlide = slides[currentIndex];

  return (
    <section
      className={cn('relative w-full h-[85vh] min-h-[500px] max-h-[900px] overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.heading}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            key={`content-${currentIndex}`}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl lg:max-w-2xl"
          >
            {/* Content Card with glassmorphism */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                {currentSlide.heading}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed mb-6">
                {currentSlide.description}
              </p>
              
              {currentSlide.ctaText && (
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {currentSlide.ctaText}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </>
      )}

      {/* Pagination Dots */}
      {showPagination && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300',
                index === currentIndex 
                  ? 'bg-amber-500 w-6 sm:w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              )}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <motion.div
          key={currentIndex}
          className="h-full bg-amber-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
        />
      </div>
    </section>
  );
};

export default HeroCarousel;
