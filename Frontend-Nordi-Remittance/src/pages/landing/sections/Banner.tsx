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
import Images from "@constants/images";

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
    description: "Based on specific requirements to bridge funding gaps with flexible repayment structures.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Equipping Growing Businesses",
    description:
      "We believe in growth and sustainability and we want to grow your business with you. See how we can help.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Sustainable Banking",
    description:
      "For over two decades, we have been taking actionable steps towards sustainability in a rapidly changing world.",
    icon: <Leaf className="h-5 w-5" />,
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
      <div
        className={cn(
          "flex h-full flex-col rounded-xl p-4 sm:rounded-2xl sm:p-6 md:p-8",
          "bg-white/80 backdrop-blur-sm dark:bg-neutral-800/80",
          "border border-neutral-100 shadow-lg dark:border-neutral-700",
          "transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-neutral-800 dark:hover:bg-neutral-800 dark:hover:shadow-neutral-900/50",
          "group cursor-pointer",
        )}
      >
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12",
              "items-center justify-center rounded-full",
              "bg-gradient-to-br from-indigo-500 to-indigo-600",
              "text-white shadow-md dark:shadow-neutral-900/30",
              "transition-transform duration-300 group-hover:scale-110",
            )}
          >
            {service.icon}
          </div>
          <h3 className="text-base font-semibold leading-tight text-neutral-800 dark:text-neutral-200 sm:text-lg">
            {service.title}
          </h3>
        </div>
        <div className="flex-grow">
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
            {service.description}
          </p>
          <a
            href="#"
            className={cn(
              "mt-3 inline-flex items-center gap-2 sm:mt-4",
              "text-sm font-medium text-indigo-600 sm:text-base",
              "transition-colors hover:text-indigo-700",
              "group/link",
            )}
          >
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
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
    <Section className="relative overflow-hidden py-8 sm:py-12 md:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-12 md:mb-16 lg:mb-20"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 sm:text-xs md:text-sm">
            Driving Growth & Sustainability
          </span>
          <h2 className="mt-2 text-lg font-bold text-neutral-900 dark:text-neutral-100 sm:text-xl md:text-3xl lg:text-4xl">
            Empowering Businesses with Smart Financial Solutions
          </h2>
          <p className="mx-auto mt-2 max-w-2xl px-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 sm:mt-4 sm:px-4 sm:text-sm md:text-base">
            Whether you're scaling your business or seeking sustainable banking practices, we offer tailor-made
            solutions to meet your unique needs.
          </p>
        </motion.div>

        {/* Banner Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-8 flex items-center justify-center gap-2 sm:mb-0 sm:gap-4"
        >
          <motion.img
            src={Images.bannerCard1}
            alt="Nordea bank card"
            className={cn("w-64 lg:w-auto", "transition-transform duration-300 hover:-rotate-6")}
            whileHover={{ scale: 1.05 }}
          />
          <motion.img
            src={Images.bannerCard2}
            alt="Nordea bank card"
            className={cn("w-64 lg:w-auto", "transition-transform duration-300 hover:rotate-6")}
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>

        {/* Service Cards - Responsive positioning */}
        <div className={cn("relative", isMdUp ? "-mt-16 sm:-mt-20 md:-mt-28 lg:-mt-32" : "mt-6 sm:mt-8")}>
          <div
            className={cn(
              "rounded-xl p-3 sm:rounded-2xl sm:p-5 md:p-8",
              "bg-amber-50 backdrop-blur-md dark:bg-amber-900/20",
              "border border-amber-200/30 dark:border-amber-700/30",
            )}
          >
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
