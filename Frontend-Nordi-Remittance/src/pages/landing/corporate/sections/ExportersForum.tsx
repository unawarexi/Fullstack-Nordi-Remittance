// ============================================================================
// EXPORTERS FORUM SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Ship,
  Globe,
  FileCheck,
  DollarSign,
  ArrowRight,
  Check,
  Shield,
  Award,
  MapPin,
  Briefcase,
  Building2,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// EXPORT SOLUTIONS
// ========================
interface ExportSolution {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const exportSolutions: ExportSolution[] = [
  {
    id: "trade-finance",
    name: "Export Trade Finance",
    description: "Financing solutions to support your export transactions",
    icon: <DollarSign className="w-6 h-6" />,
    features: [
      "Pre-export financing",
      "Post-export financing",
      "Export bills discounting",
      "Supplier credit facilities",
    ],
  },
  {
    id: "documentary",
    name: "Documentary Services",
    description: "Complete documentary trade services for exporters",
    icon: <FileCheck className="w-6 h-6" />,
    features: [
      "Letters of credit",
      "Documentary collections",
      "Bank guarantees",
      "Standby L/Cs",
    ],
  },
  {
    id: "fx-services",
    name: "FX & Hedging",
    description: "Manage currency risks on your export proceeds",
    icon: <Globe className="w-6 h-6" />,
    features: [
      "Competitive FX rates",
      "Forward contracts",
      "FX options",
      "Proceeds repatriation",
    ],
  },
  {
    id: "logistics",
    name: "Logistics Support",
    description: "End-to-end export logistics and documentation",
    icon: <Ship className="w-6 h-6" />,
    features: [
      "Shipping finance",
      "Insurance solutions",
      "Documentation support",
      "Customs facilitation",
    ],
  },
];

// ========================
// EXPORT DESTINATIONS
// ========================
const exportDestinations = [
  { region: "Europe", share: "35%" },
  { region: "Asia", share: "28%" },
  { region: "Americas", share: "22%" },
  { region: "Africa", share: "15%" },
];

// ========================
// SUCCESS METRICS
// ========================
const successMetrics = [
  { value: "$2B+", label: "Export Finance Annually" },
  { value: "500+", label: "Active Exporters" },
  { value: "80+", label: "Countries Reached" },
  { value: "48hrs", label: "Avg. Processing Time" },
];

// ========================
// MAIN COMPONENT
// ========================
const ExportersForum: React.FC = () => {
  return (
    <Section id="exporters-forum" className="py-10 sm:py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
            <Ship className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Exporters Forum
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Powering Nigerian Exports
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Comprehensive trade finance and support services for exporters, 
            helping you expand into global markets with confidence.
          </p>
        </motion.div>

        {/* Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          {successMetrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center p-3 sm:p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30"
            >
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-600 dark:text-cyan-400 leading-none">{metric.value}</p>
              <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 uppercase tracking-wider font-medium">{metric.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {exportSolutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-cyan-300 transition-all duration-300 flex flex-col"
              )}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                {React.cloneElement(solution.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 leading-tight">{solution.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-4 sm:mb-5 leading-relaxed">{solution.description}</p>
              
              <ul className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8 flex-1">
                {solution.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
 
              <Button variant="outline" className="w-full text-sm py-2 group-hover:border-cyan-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                Learn More
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Export Destinations & Member Benefits */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Export Destinations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 h-full"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
              <h4 className="font-bold text-neural-900 dark:text-white text-sm sm:text-base uppercase tracking-wider">Export Destinations</h4>
            </div>
            <div className="space-y-5 sm:space-y-6">
              {exportDestinations.map((dest) => (
                <div key={dest.region} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-[13px] sm:text-sm font-bold text-neutral-700 dark:text-neutral-200">{dest.region}</span>
                      <span className="text-[13px] sm:text-sm font-bold text-cyan-600 dark:text-cyan-400">{dest.share}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: dest.share }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 mt-6 sm:mt-8 font-medium">
              * Based on 2024 export finance volume
            </p>
          </motion.div>

          {/* Member Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-8 rounded-2xl bg-cyan-600 text-white"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              <h4 className="font-bold text-sm sm:text-base uppercase tracking-wider">Forum Member Benefits</h4>
            </div>
            <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {[
                { icon: Shield, text: "Priority processing for trade finance" },
                { icon: DollarSign, text: "Preferential FX rates on export proceeds" },
                { icon: Building2, text: "Access to NEXIM Bank facilities" },
                { icon: Briefcase, text: "Trade missions & buyer connections" },
                { icon: Globe, text: "Market intelligence & advisory" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[13px] sm:text-sm font-medium mt-1.5 sm:mt-2.5 leading-tight">{item.text}</span>
                </li>
              ))}
            </ul>
            <Button variant="primary" size="lg" className="w-full bg-white dark:bg-neutral-800 text-cyan-600 hover:bg-cyan-50 text-sm py-2.5 sm:py-3 px-8">
              Join Exporters Forum
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default ExportersForum;
