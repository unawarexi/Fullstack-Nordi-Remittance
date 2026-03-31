// ============================================================================
// CORPORATE SECTOR SOLUTIONS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Factory,
  Plane,
  ShoppingBag,
  Zap,
  Droplets,
  Building2,
  ArrowRight,
  Check,
  TrendingUp,
  Globe,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// INDUSTRY SECTORS
// ========================
interface IndustrySector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  solutions: string[];
  clients: number;
}

const industrySectors: IndustrySector[] = [
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "End-to-end financial solutions for production and supply chain",
    icon: <Factory className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    solutions: [
      "Equipment financing",
      "Trade finance",
      "FX hedging",
      "Working capital",
    ],
    clients: 120,
  },
  {
    id: "aviation",
    name: "Aviation & Transport",
    description: "Specialized financing for aircraft and fleet management",
    icon: <Plane className="w-6 h-6" />,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
    solutions: [
      "Aircraft leasing",
      "Fleet financing",
      "Jet fuel hedging",
      "Infrastructure loans",
    ],
    clients: 45,
  },
  {
    id: "retail",
    name: "Retail & FMCG",
    description: "Comprehensive solutions for retail and consumer goods",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    solutions: [
      "Distributor finance",
      "POS & payments",
      "Inventory financing",
      "E-commerce solutions",
    ],
    clients: 200,
  },
  {
    id: "energy",
    name: "Oil, Gas & Energy",
    description: "Financial partner for the energy sector",
    icon: <Zap className="w-6 h-6" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    solutions: [
      "Project finance",
      "Commodity hedging",
      "Structured trade",
      "Green financing",
    ],
    clients: 85,
  },
  {
    id: "utilities",
    name: "Utilities & Infrastructure",
    description: "Long-term financing for essential services",
    icon: <Droplets className="w-6 h-6" />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    solutions: [
      "PPP financing",
      "Bond issuance",
      "Rate hedging",
      "Asset financing",
    ],
    clients: 60,
  },
  {
    id: "real-estate",
    name: "Real Estate & Construction",
    description: "Development and commercial property financing",
    icon: <Building2 className="w-6 h-6" />,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
    solutions: [
      "Development loans",
      "Commercial mortgages",
      "REIT advisory",
      "Joint ventures",
    ],
    clients: 95,
  },
];

// ========================
// MAIN COMPONENT
// ========================
const CorporateSector: React.FC = () => {
  return (
    <Section id="corporate-sector" className="py-10 sm:py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Industry Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Sector-Specific Expertise
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Deep industry knowledge combined with tailored financial solutions 
            to address the unique challenges of your sector.
          </p>
        </motion.div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industrySectors.map((sector, index) => (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={cn(
                "group relative p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
              )}
            >
              {/* Icon */}
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", sector.bgColor, sector.color)}>
                {sector.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{sector.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{sector.description}</p>

              {/* Solutions */}
              <ul className="space-y-2 mb-6">
                {sector.solutions.map((solution) => (
                  <li key={solution} className="flex items-center gap-2">
                    <Check className={cn("w-4 h-4", sector.color)} />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">{solution}</span>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <TrendingUp className="w-4 h-4" />
                  {sector.clients}+ clients
                </div>
                <Button
                  variant="ghost"
                  className={cn("text-sm p-0 h-auto font-medium", sector.color, "hover:opacity-80")}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 p-6 sm:p-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white text-center"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 leading-tight">Don't See Your Industry?</h3>
          <p className="text-sm sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Our corporate banking team has expertise across all major industries. 
            Connect with a relationship manager to discuss your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm py-2.5 sm:py-3 px-8">
              Contact Us
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-sm py-2.5 sm:py-3 px-8">
              View All Industries
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CorporateSector;
