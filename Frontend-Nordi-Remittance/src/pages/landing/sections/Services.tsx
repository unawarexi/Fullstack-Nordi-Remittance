// ============================================================================
// BANKING SERVICES - Responsive slider section
// ============================================================================

import Images from '@constants/images';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@utils/cn";
import { useBreakpoint, useIsMobile } from "@hooks/index";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// SERVICES DATA
// ========================
const sliderData = [
  {
    id: 1,
    image: Images.PersonalSavings,
    icon: Images.PersonalSavingsIcon,
    desc: "Personal Savings Account",
  },
  {
    id: 2,
    image: Images.HomeLoans,
    icon: Images.HomeLoansIcon,
    desc: "Home Loans",
  },
  {
    id: 3,
    image: Images.BusinessLoans,
    icon: Images.BusinessLoansIcon,
    desc: "Business Loans",
  },
  {
    id: 4,
    image: Images.RealEstate,
    icon: Images.RealEstateIcon,
    desc: "Commercial Real Estate",
  },
  {
    id: 5,
    image: Images.Insurance,
    icon: Images.InsuranceIcon,
    desc: "Personal Insurance",
  },
  {
    id: 6,
    image: Images.Management,
    icon: Images.ManagementIcon,
    desc: "Wealth Management",
  },
  {
    id: 7,
    image: Images.Ecommerce,
    icon: Images.EcommerceIcon,
    desc: "E-commerce Payments",
  },
  {
    id: 8,
    image: Images.Retirement,
    icon: Images.RetirementIcon,
    desc: "Retirement and Family Planning",
  },
];

// ========================
// SERVICE CARD COMPONENT
// ========================
interface ServiceCardProps {
  slide: typeof sliderData[0];
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ slide, index }) => {
  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={slide.image}
          alt={slide.desc}
          className="h-[220px] sm:h-[260px] md:h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Glassmorphism Description */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl bg-lime-500/20 p-3 sm:p-4 text-slate-50 backdrop-blur-md border border-white/10"
        >
          <img
            src={slide.icon}
            alt={slide.desc}
            className="h-8 w-8 sm:h-10 sm:w-10"
          />
          <p className="text-sm sm:text-base md:text-lg font-semibold text-center leading-tight">
            {slide.desc}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const BankingServices = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const { isSmUp, isMdUp, isLgUp } = useBreakpoint();

  // Calculate visible slides based on breakpoint
  const visibleSlides = isLgUp ? 4 : isMdUp ? 3 : isSmUp ? 2 : 1;
  const maxSlide = sliderData.length - visibleSlides;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  }, [maxSlide]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? maxSlide : prev - 1));
  }, [maxSlide]);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (!isHovered) {
      const autoSlide = setInterval(nextSlide, 5000);
      return () => clearInterval(autoSlide);
    }
  }, [isHovered, nextSlide]);

  // Reset slide when screen size changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [visibleSlides]);

  return (
    <Section className="relative bg-slate-100 py-12 sm:py-16 md:py-20 -mt-6 sm:-mt-10">
      <Container>
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            Access More <span className="text-amber-500">Banking Services</span>
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-3xl text-sm sm:text-base text-slate-600 px-4">
            Whether it's your child's first savings account, your personal savings
            account, your first retirement plan, or a business loan, we offer
            personal and corporate banking products and services tailored to meet
            your needs.
          </p>
        </motion.div>

        {/* Slider Section */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className={cn(
              "absolute -left-2 sm:-left-4 md:-left-6 top-1/2 z-10 -translate-y-1/2",
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
              "bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl dark:hover:shadow-neutral-900/50",
              "flex items-center justify-center",
              "transition-all duration-300 hover:scale-110",
              "focus:outline-none focus:ring-2 focus:ring-amber-500"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </button>

          <button
            onClick={nextSlide}
            className={cn(
              "absolute -right-2 sm:-right-4 md:-right-6 top-1/2 z-10 -translate-y-1/2",
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
              "bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl dark:hover:shadow-neutral-900/50",
              "flex items-center justify-center",
              "transition-all duration-300 hover:scale-110",
              "focus:outline-none focus:ring-2 focus:ring-amber-500"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </button>

          {/* Slides Container */}
          <div className="overflow-hidden px-1 sm:px-2">
            <motion.div
              animate={{ x: `-${currentSlide * (100 / visibleSlides)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex"
            >
              {sliderData.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "flex-shrink-0 px-2 sm:px-3",
                    visibleSlides === 1 && "w-full",
                    visibleSlides === 2 && "w-1/2",
                    visibleSlides === 3 && "w-1/3",
                    visibleSlides === 4 && "w-1/4"
                  )}
                >
                  <ServiceCard slide={slide} index={index} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dot Indicators */}
          <div className="mt-6 sm:mt-8 flex justify-center gap-2">
            {Array.from({ length: maxSlide + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === index 
                    ? "w-8 sm:w-10 bg-amber-50 dark:bg-amber-900/200" 
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default BankingServices;
