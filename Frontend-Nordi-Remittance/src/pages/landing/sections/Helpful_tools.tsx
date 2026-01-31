// ============================================================================
// HELPFUL TOOLS - Responsive tools section with slider
// ============================================================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  MapPin, 
  HelpCircle, 
  Gift, 
  PiggyBank, 
  Flag 
} from 'lucide-react';
import { cn } from '@utils/cn';
import { useBreakpoint, useIsMobile } from '@hooks/index';
import { Section } from '@components/layout/Section';
import { Container } from '@components/layout/Container';

// ========================
// TOOLS DATA
// ========================
interface ToolItem {
  title: string;
  icon: React.ReactNode;
  description?: string;
}

const HelpfulData: ToolItem[] = [
  { 
    title: '*901# Banking', 
    icon: <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />,
    description: 'Quick USSD banking'
  },
  { 
    title: 'ATM & Branch Locator', 
    icon: <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />,
    description: 'Find nearest branch'
  },
  { 
    title: 'HELP', 
    icon: <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
    description: '24/7 customer support'
  },
  { 
    title: 'More Xtravaganza', 
    icon: <Gift className="w-6 h-6 sm:w-7 sm:h-7" />,
    description: 'Rewards & benefits'
  },
  { 
    title: 'Instant Savings', 
    icon: <PiggyBank className="w-6 h-6 sm:w-7 sm:h-7" />,
    description: 'Open account instantly'
  },
  { 
    title: 'Whistle Blower', 
    icon: <Flag className="w-6 h-6 sm:w-7 sm:h-7" />,
    description: 'Report issues safely'
  },
];

// ========================
// TOOL CARD COMPONENT
// ========================
interface ToolCardProps {
  tool: ToolItem;
  index: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={cn(
        "flex flex-col items-center justify-center",
        "h-28 sm:h-32 md:h-36 lg:h-40 p-3 sm:p-4",
        "bg-gradient-to-br from-neutral-50 to-neutral-100",
        "rounded-xl sm:rounded-2xl shadow-md",
        "border border-neutral-200/60",
        "hover:shadow-xl hover:border-amber-300/50",
        "transition-all duration-300 cursor-pointer",
        "group"
      )}
    >
      <div className={cn(
        "p-2.5 sm:p-3 rounded-full",
        "bg-gradient-to-br from-amber-100 to-amber-200",
        "text-amber-600 mb-2 sm:mb-3",
        "group-hover:from-amber-200 group-hover:to-amber-300",
        "transition-all duration-300"
      )}>
        {tool.icon}
      </div>
      <p className="text-xs sm:text-sm font-medium text-neutral-700 text-center leading-tight">
        {tool.title}
      </p>
      {tool.description && (
        <p className="text-[10px] sm:text-xs text-neutral-500 text-center mt-1 hidden sm:block">
          {tool.description}
        </p>
      )}
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const Helpful_tools: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const { isSmUp, isMdUp, isLgUp } = useBreakpoint();

  // Calculate visible items based on breakpoint
  const visibleItems = isLgUp ? 6 : isMdUp ? 4 : isSmUp ? 3 : 2;
  const maxIndex = Math.max(0, HelpfulData.length - visibleItems);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  // Show all items on large screens, slider on smaller
  const showSlider = !isLgUp;

  return (
    <Section className="py-8 sm:py-12 md:py-16 bg-white">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800">
            Helpful <span className="text-amber-500">Tools</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Quick access to our most popular services
          </p>
        </motion.div>

        {/* Tools Grid/Slider */}
        <div className="relative">
          {/* Navigation Arrows - Only show when slider is active */}
          {showSlider && (
            <>
              <button
                onClick={handlePrev}
                className={cn(
                  "absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10",
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full",
                  "bg-white shadow-md hover:shadow-lg",
                  "flex items-center justify-center",
                  "text-neutral-600 hover:text-amber-600",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-amber-400"
                )}
                aria-label="Previous tools"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handleNext}
                className={cn(
                  "absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10",
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full",
                  "bg-white shadow-md hover:shadow-lg",
                  "flex items-center justify-center",
                  "text-neutral-600 hover:text-amber-600",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-amber-400"
                )}
                aria-label="Next tools"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Tools Container */}
          <div className="overflow-hidden px-1">
            {isLgUp ? (
              // Grid layout for large screens
              <div className="grid grid-cols-6 gap-3 sm:gap-4">
                {HelpfulData.map((tool, index) => (
                  <ToolCard key={index} tool={tool} index={index} />
                ))}
              </div>
            ) : (
              // Slider for smaller screens
              <motion.div
                animate={{ x: `-${currentIndex * (100 / visibleItems)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex"
              >
                {HelpfulData.map((tool, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 px-1.5 sm:px-2",
                      visibleItems === 2 && "w-1/2",
                      visibleItems === 3 && "w-1/3",
                      visibleItems === 4 && "w-1/4"
                    )}
                  >
                    <ToolCard tool={tool} index={index} />
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Dot Indicators - Only for slider */}
          {showSlider && maxIndex > 0 && (
            <div className="flex justify-center gap-1.5 mt-4 sm:mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                    currentIndex === index
                      ? "w-4 sm:w-6 bg-amber-500"
                      : "w-1.5 sm:w-2 bg-neutral-300 hover:bg-neutral-400"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default Helpful_tools;
