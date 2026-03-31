// ============================================================================
// BANNER SECTION - Responsive banner with service cards
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, TrendingUp, Leaf } from "lucide-react";
import { cn } from "@utils/cn";
import { useBreakpoint, useIsMobile } from "@hooks/index";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Grid } from "@components/layout/Grid";
import Images from '@constants/images';

// ========================
// SERVICES DATA
// ========================
interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const services: Service[] = [
  {
    title: "Financing",
    description:
      "Based on specific requirements to bridge funding gaps with flexible repayment structures.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Equipping Growing Businesses",
    description:
      "We believe in growth and sustainability and we want to grow your business with you. See how we can help.",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    title: "Sustainable Banking",
    description:
      "For over two decades, we have been taking actionable steps towards sustainability in a rapidly changing world.",
    icon: <Leaf className="w-5 h-5" />,
  },
];

// ========================
// SERVICE CARD COMPONENT
// ========================
interface ServiceCardProps {
  service: Service;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <div className={cn(
        "flex h-full flex-col rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8",
        "bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm",
        "border border-neutral-100 dark:border-neutral-700 shadow-lg",
        "hover:shadow-xl dark:hover:shadow-neutral-900/50 hover:bg-white dark:bg-neutral-800 dark:hover:bg-neutral-800 transition-all duration-300",
        "group cursor-pointer"
      )}>
        <div className="mb-3 sm:mb-4 flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0",
            "items-center justify-center rounded-full",
            "bg-gradient-to-br from-indigo-500 to-indigo-600",
            "text-white shadow-md dark:shadow-neutral-900/30",
            "group-hover:scale-110 transition-transform duration-300"
          )}>
            {service.icon}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
            {service.title}
          </h3>
        </div>
        <div className="flex-grow">
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {service.description}
          </p>
          <a 
            href="#"
            className={cn(
              "mt-3 sm:mt-4 inline-flex items-center gap-2",
              "text-sm sm:text-base font-medium text-indigo-600",
              "hover:text-indigo-700 transition-colors",
              "group/link"
            )}
          >
            Learn More
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// ========================
// MAIN BANNER COMPONENT
// ========================
const Banner: React.FC = () => {
  const isMobile = useIsMobile();
  const { isMdUp } = useBreakpoint();

  return (
    <Section className="relative py-8 sm:py-12 md:py-16 lg:py-24 overflow-hidden">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 text-center"
        >
          <span className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider text-indigo-500 uppercase">
            Driving Growth & Sustainability
          </span>
          <h2 className="mt-2 text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Empowering Businesses with Smart Financial Solutions
          </h2>
          <p className="mt-2 sm:mt-4 mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed px-2 sm:px-4">
            Whether you're scaling your business or seeking sustainable banking
            practices, we offer tailor-made solutions to meet your unique needs.
          </p>
        </motion.div>

        {/* Banner Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex justify-center items-center gap-2 sm:gap-4 mb-8 sm:mb-0"
        >
          <motion.img 
            src={Images.bannerCard1} 
            alt="Nordea bank card"
            className={cn(
              "",
              "rounded-lg shadow-xl",
              "hover:-rotate-6 transition-transform duration-300"
            )}
            whileHover={{ scale: 1.05 }}
          />
          <motion.img 
            src={Images.bannerCard2} 
            alt="Nordea bank card"
            className={cn(
              "",
              "rounded-lg shadow-xl",
              "hover:rotate-6 transition-transform duration-300"
            )}
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>

        {/* Service Cards - Responsive positioning */}
        <div className={cn(
          "relative",
          isMdUp ? "-mt-16 sm:-mt-20 md:-mt-28 lg:-mt-32" : "mt-6 sm:mt-8"
        )}>
          <div className={cn(
            "rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-8",
            "bg-amber-50 dark:bg-amber-900/20 backdrop-blur-md",
            "border border-amber-200/30 dark:border-amber-700/30"
          )}>
            <Grid cols={{ xs: 1, md: 3 }} gap="md">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} index={index} />
              ))}
            </Grid>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Banner;
