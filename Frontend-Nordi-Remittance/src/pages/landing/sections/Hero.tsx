// ============================================================================
// HERO CAROUSEL - Responsive hero section with auto-sliding carousel
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@utils/cn";
import { useBreakpoint, useIsMobile } from "@hooks/index";
import { Button } from "@components/ui/Button";
import Images from "@utils/constants/Image_strings";
import Contents from "./Contents";

const slides = [
  {
    image: Images.carousel6,
    heading:
      "Invest globally to unlock unlimited opportunities for a prosperous and financially secure future.",
    description:
      "Expand your horizons with Nordea Remit’s global investment options. Designed to secure your financial future, our investment solutions provide you with access to global markets, innovative strategies, and personalized advice. Start investing globally today and take your financial success to the next level with Nordea Remit’s guidance and expertise.",
  },
  {
    image: Images.carousel4,
    heading:
      "Elevate your lifestyle with American Express, offering exclusive rewards and unmatched banking services.",
    description:
      "With our exclusive American Express partnerships, experience premium banking services designed for individuals who value sophistication. From concierge services to rewards, Nordea Remit offers tailored solutions to elevate your financial lifestyle. Join today and enjoy the unparalleled benefits of American Express and Nordea Remit, designed to support your ambitions.",
  },
  {
    image: Images.carousel1,
    heading:
      "Stay protected with Nordea Remit’s cutting-edge security and theft protection for your peace of mind.",
    description:
      "Prioritize your financial security with Nordea Remit’s top-tier security and theft protection features. Our robust solutions ensure that your accounts and transactions remain safe, allowing you to focus on your goals without worry. Whether at home or abroad, our comprehensive protection gives you the confidence to manage your finances securely.",
  },
  {
    image: Images.carousel2,
    heading:
      "Tailored banking solutions for businesses, empowering growth and innovation across all industries and sectors.",
    description:
      "Nordea Remit understands the unique challenges businesses face, which is why we offer industry-specific banking solutions. From startups to large corporations, our tailored services help businesses optimize financial management, reduce risk, and grow. We work alongside you to support your growth journey, ensuring your business thrives in a competitive market.",
  },
  {
    image: Images.carousel3,
    heading:
      "Empower your business with Nordea Remit’s flexible loan options for growth and financial stability.",
    description:
      "At Nordea Remit, we believe in supporting businesses at every stage of their journey. Our flexible loan options provide the financial backing your business needs for expansion, innovation, or stability. Whether you’re starting out or scaling up, we’re here to empower your growth and provide the financial solutions you need.",
  },
  {
    image: Images.carousel5,
    heading:
      "Unlock a world of convenience and rewards with the Nordea Bank Card – your global partner.",
    description:
      "The Nordea Bank Card offers a world of benefits, providing seamless transactions and exclusive rewards. With worldwide acceptance, it’s your perfect companion for both personal and business finances. Whether you’re traveling or shopping, enjoy the convenience and support of Nordea Remit’s cutting-edge banking solutions wherever life takes you.",
  },
  {
    image: Images.carousel7,
    heading:
      "Explore limitless potential with Nordea Remit’s innovative solutions for global remittance and banking.",
    description:
      "With Nordea Remit’s advanced global remittance and banking services, you have the tools to expand your financial horizons. Our solutions empower individuals and businesses to send money across borders quickly, securely, and affordably. Discover a world of opportunities as we provide the technology and support to help you thrive internationally.",
  },
];

const HeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();
  const { isMdUp, isLgUp } = useBreakpoint();

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1,
    );
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
    );
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [handleNext, isPaused]);

  const handlePaginationClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <section className="relative">
      {/* Hero Section */}
      <section 
        className={cn(
          "relative w-full overflow-hidden bg-slate-900",
          "h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh]"
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].heading}
              className="h-full w-full object-cover"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className={cn(
                    "max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
                    "p-4 sm:p-6 md:p-8 lg:p-10",
                    "bg-white/5 backdrop-blur-sm",
                    "border border-white/10 rounded-xl sm:rounded-2xl"
                  )}
                >
                  {/* Heading */}
                  <h1
                    className={cn(
                      "font-bold text-white leading-tight",
                      "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl",
                      "mb-3 sm:mb-4 md:mb-6"
                    )}
                  >
                    {slides[currentIndex].heading}
                  </h1>

                  {/* Description */}
                  <p
                    className={cn(
                      "text-neutral-300 leading-relaxed",
                      "text-sm sm:text-base md:text-lg",
                      "mb-4 sm:mb-6 md:mb-8",
                      "line-clamp-3 sm:line-clamp-none"
                    )}
                  >
                    {slides[currentIndex].description}
                  </p>

                  {/* CTA Button */}
                  <Button
                    size={isMobile ? "sm" : "md"}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Nordea Access
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Hidden on mobile */}
        {isMdUp && (
          <>
            <button
              onClick={handlePrev}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 md:w-12 md:h-12 rounded-full",
                "bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                "flex items-center justify-center",
                "text-white transition-all duration-300",
                "border border-white/20"
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 md:w-12 md:h-12 rounded-full",
                "bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                "flex items-center justify-center",
                "text-white transition-all duration-300",
                "border border-white/20"
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        <div className={cn(
          "absolute z-20 flex gap-2",
          "bottom-8 sm:bottom-16 md:bottom-24 lg:bottom-32",
          "left-4 sm:left-6 lg:left-8"
        )}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handlePaginationClick(index)}
              className={cn(
                "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-8 sm:w-10 bg-amber-500"
                  : "w-2 sm:w-3 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Contents Section - Responsive positioning */}
      <div className={cn(
        "container mx-auto px-4",
        "relative z-30",
        isMdUp 
          ? "-mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28" 
          : "mt-4"
      )}>
        <Contents />
      </div>
    </section>
  );
}; 

export default HeroCarousel;
