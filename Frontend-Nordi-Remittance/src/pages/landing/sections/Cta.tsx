// ============================================================================
// CTA SECTION - Responsive ways to bank section with slider
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@utils/cn';
import { useBreakpoint, useIsMobile } from '@hooks/index';
import { Section } from '@components/layout/Section';
import { Container } from '@components/layout/Container';
import Images from '@constants/images';
import Section_divider from '@components/custom_shapes/Section_divider';

// ========================
// DATA
// ========================
const iconData = [
  {
    title: 'USSD Banking',
    description: 'Bank securely with simple USSD codes.',
    icon: Images.ussdBanking,
    image: Images.ussdBg,
  },
  {
    title: 'Online Banking',
    description: 'Manage your account from anywhere online.',
    icon: Images.onlineBanking,
    image: Images.onlineBg,
  },
  {
    title: 'Mobile Banking',
    description: 'Access your bank on your phone anytime.',
    icon: Images.mobileBanking,
    image: Images.mobileBg,
  },
  {
    title: 'American Express Cards',
    description: 'Shop and pay with ease using AmEx cards.',
    icon: Images.cardBanking,
    image: Images.cardBg,
  },
];

// ========================
// CTA CARD COMPONENT
// ========================
interface CtaCardProps {
  item: typeof iconData[0];
  index: number;
}

const CtaCard: React.FC<CtaCardProps> = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative flex flex-col items-center text-center",
        "overflow-hidden rounded-xl sm:rounded-2xl shadow-lg",
        "h-48 sm:h-56 md:h-64",
        "group cursor-pointer"
      )}
    >
      {/* Background Image - Shows on hover */}
      <div className={cn(
        "absolute inset-0 w-full h-full",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500 z-10"
      )}>
        <img
          src={item.image}
          alt={item.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Icon and Description */}
      <div className={cn(
        "z-20 relative h-full w-full",
        "flex flex-col items-center justify-center",
        "p-4 sm:p-6",
        "bg-slate-800/90",
        "group-hover:bg-transparent",
        "transition-all duration-500"
      )}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4">
          <img
            src={item.icon}
            alt={item.title}
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
          {item.title}
        </h3>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/80 hidden sm:block">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const CtaSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const { isSmUp, isMdUp, isLgUp } = useBreakpoint();

  // Calculate visible items based on breakpoint
  const visibleItems = isLgUp ? 4 : isMdUp ? 3 : isSmUp ? 2 : 1;
  const maxIndex = Math.max(0, iconData.length - visibleItems);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [handleNext]);

  // Get visible items
  const getVisibleItems = () => {
    return iconData.slice(currentIndex, currentIndex + visibleItems);
  };

  return (
    <section className="relative">
      {/* Decorative Divider */}
      <div className="absolute top-0 left-0 right-0 z-0">
        <Section_divider />
      </div>

      {/* Main Content */}
      <Section className="relative z-10 py-16 sm:py-20 md:py-28 lg:py-32">
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="text-amber-500">Nordea more</span> ways to bank.
            </h2>
            <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base text-neutral-600 dark:text-neutral-400 px-4">
              The less time you spend in a bank, the more time you have for yourself. 
              Choose from a variety of easy and secure ways to manage your money.
            </p>
          </motion.div>

          {/* Slider Section */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className={cn(
                "absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
                "bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600",
                "flex items-center justify-center",
                "text-white shadow-lg",
                "transition-all duration-300 hover:scale-110"
              )}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              className={cn(
                "absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
                "bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600",
                "flex items-center justify-center",
                "text-white shadow-lg",
                "transition-all duration-300 hover:scale-110"
              )}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Items Grid */}
            <div className="overflow-hidden px-1">
              <motion.div
                animate={{ x: `-${currentIndex * (100 / visibleItems)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex"
              >
                {iconData.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 px-2 sm:px-3",
                      visibleItems === 1 && "w-full",
                      visibleItems === 2 && "w-1/2",
                      visibleItems === 3 && "w-1/3",
                      visibleItems === 4 && "w-1/4"
                    )}
                  >
                    <CtaCard item={item} index={index} />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6 sm:mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentIndex === index
                      ? "w-6 sm:w-8 bg-amber-50 dark:bg-amber-900/200"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:bg-neutral-700/500"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </section>
  );
};

export default CtaSection;
