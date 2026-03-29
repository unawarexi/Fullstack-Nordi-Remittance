// ============================================================================
// PARTNERS SECTION - Partner logos and awards
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Award, Trophy, Medal, Star } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// PARTNERS DATA
// ========================
const partners = [
  { name: "Visa", logo: "VISA" },
  { name: "Mastercard", logo: "Mastercard" },
  { name: "Apple Pay", logo: "Apple Pay" },
  { name: "Google Pay", logo: "Google Pay" },
  { name: "PayPal", logo: "PayPal" },
  { name: "Stripe", logo: "Stripe" },
  { name: "Wise", logo: "Wise" },
  { name: "Plaid", logo: "Plaid" },
];

const awards = [
  {
    title: "Best Digital Bank",
    year: "2024",
    org: "Global Finance",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    title: "Most Innovative",
    year: "2024",
    org: "Banking Tech",
    icon: <Star className="w-5 h-5" />,
  },
  {
    title: "Customer Choice",
    year: "2023",
    org: "Consumer Reports",
    icon: <Award className="w-5 h-5" />,
  },
  {
    title: "Best Mobile App",
    year: "2024",
    org: "App Store",
    icon: <Medal className="w-5 h-5" />,
  },
];

// ========================
// MAIN COMPONENT
// ========================
const Partners: React.FC = () => {
  return (
    <Section background="light" className="py-12 lg:py-16">
      <Container size="xl">
        {/* Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Trusted Partners
          </span>
        </motion.div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-6 lg:gap-10 mb-16"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "px-6 py-3 rounded-lg",
                "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
                "text-neutral-400 font-bold text-lg",
                "hover:text-neutral-600 dark:text-neutral-300 hover:border-neutral-200 dark:border-neutral-700 transition-all"
              )}
            >
              {partner.logo}
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 mb-12" />

        {/* Awards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Award-Winning Banking
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Recognized globally for excellence in banking services
          </p>
        </motion.div>

        {/* Awards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {awards.map((award, index) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "text-center p-5 rounded-xl",
                "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
                "hover:shadow-md transition-shadow"
              )}
            >
              <div className="inline-flex p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 mb-3">
                {award.icon}
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                {award.title}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{award.org}</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded">
                {award.year}
              </span>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Partners;
