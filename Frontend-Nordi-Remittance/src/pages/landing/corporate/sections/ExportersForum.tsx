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
    <Section id="exporters-forum" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4">
            <Ship className="w-4 h-4" />
            Exporters Forum
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Powering Nigerian Exports
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Comprehensive trade finance and support services for exporters, 
            helping you expand into global markets with confidence.
          </p>
        </motion.div>

        {/* Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {successMetrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center p-4 rounded-xl bg-cyan-50 border border-cyan-100"
            >
              <p className="text-2xl lg:text-3xl font-bold text-cyan-600">{metric.value}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{metric.label}</p>
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
                "group relative p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-cyan-300 transition-all duration-300"
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
                {solution.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{solution.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{solution.description}</p>
              
              <ul className="space-y-2 mb-6">
                {solution.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full group-hover:border-cyan-500 group-hover:text-cyan-600">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
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
            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-cyan-600" />
              <h4 className="font-semibold text-neutral-900 dark:text-white">Export Destinations</h4>
            </div>
            <div className="space-y-4">
              {exportDestinations.map((dest) => (
                <div key={dest.region} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{dest.region}</span>
                      <span className="text-sm text-cyan-600">{dest.share}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: dest.share }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
              Based on 2024 export finance volume
            </p>
          </motion.div>

          {/* Member Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-cyan-600 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5" />
              <h4 className="font-semibold">Forum Member Benefits</h4>
            </div>
            <ul className="space-y-4 mb-6">
              {[
                { icon: Shield, text: "Priority processing for trade finance" },
                { icon: DollarSign, text: "Preferential FX rates on export proceeds" },
                { icon: Building2, text: "Access to NEXIM Bank facilities" },
                { icon: Briefcase, text: "Trade missions & buyer connections" },
                { icon: Globe, text: "Market intelligence & advisory" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
            <Button variant="primary" className="w-full bg-white dark:bg-neutral-800 text-cyan-600 hover:bg-cyan-50">
              Join Exporters Forum
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default ExportersForum;
