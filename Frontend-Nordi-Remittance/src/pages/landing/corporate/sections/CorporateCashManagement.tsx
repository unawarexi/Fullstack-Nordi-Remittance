// ============================================================================
// CORPORATE CASH MANAGEMENT SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowLeftRight,
  Building2,
  Globe,
  ArrowRight,
  Check,
  Layers,
  Receipt,
  BarChart3,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CASH MANAGEMENT SOLUTIONS
// ========================
interface CashSolution {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  capabilities: string[];
}

const cashSolutions: CashSolution[] = [
  {
    id: "global-liquidity",
    name: "Global Liquidity Management",
    description: "Centralize and optimize cash across all subsidiaries",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-teal-500",
    capabilities: [
      "Multi-currency pooling",
      "Notional pooling structures",
      "Interest optimization",
      "Intercompany loan automation",
    ],
  },
  {
    id: "payments-hub",
    name: "Corporate Payments Hub",
    description: "Streamlined payment processing and execution",
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: "bg-blue-500",
    capabilities: [
      "SWIFT connectivity",
      "Real-time payments",
      "Multi-bank integration",
      "Payment factory setup",
    ],
  },
  {
    id: "receivables",
    name: "Receivables Solutions",
    description: "Accelerate collections and improve DSO",
    icon: <Receipt className="w-6 h-6" />,
    color: "bg-emerald-500",
    capabilities: [
      "Virtual accounts",
      "Lockbox services",
      "Direct debit",
      "Auto reconciliation",
    ],
  },
  {
    id: "working-capital",
    name: "Working Capital Optimization",
    description: "Improve cash conversion cycle efficiency",
    icon: <Layers className="w-6 h-6" />,
    color: "bg-violet-500",
    capabilities: [
      "Supply chain finance",
      "Dynamic discounting",
      "Inventory financing",
      "Distributor finance",
    ],
  },
];

// ========================
// PLATFORM FEATURES
// ========================
const platformFeatures = [
  { icon: Zap, title: "Real-Time", value: "Instant visibility" },
  { icon: Shield, title: "Secure", value: "Multi-layer auth" },
  { icon: Globe, title: "Global", value: "180+ currencies" },
  { icon: Clock, title: "24/7", value: "Always available" },
];

// ========================
// MAIN COMPONENT
// ========================
const CorporateCashManagement: React.FC = () => {
  return (
    <Section id="corporate-cash-management" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-teal-100 text-teal-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Corporate Cash Management
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Global Treasury Excellence
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Comprehensive cash management solutions for multinational corporations 
            to optimize liquidity, streamline payments, and gain complete visibility.
          </p>
        </motion.div>

        {/* Platform Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-[13px] sm:text-sm leading-tight">{feature.title}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{feature.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {cashSolutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 transition-all duration-300"
              )}
            >
              <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4", solution.color)}>
                {React.cloneElement(solution.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 leading-tight">{solution.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4 leading-relaxed">{solution.description}</p>
              
              <ul className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6">
                {solution.capabilities.map((capability) => (
                  <li key={capability} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500 mt-0.5 shrink-0" />
                    <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">{capability}</span>
                  </li>
                ))}
              </ul>
 
              <Button variant="outline" className="w-full text-sm py-2 group-hover:border-teal-500 group-hover:text-teal-600">
                Learn More
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 leading-tight">Enterprise Treasury Platform</h3>
              <p className="text-sm sm:text-base text-teal-100 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Connect all your banking relationships, ERP systems, and treasury 
                workstations through our unified platform with seamless API integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="primary" className="w-full sm:w-auto bg-white dark:bg-neutral-800 text-teal-700 hover:bg-teal-50 text-sm py-2.5 sm:py-3 px-6">
                  Request Demo
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
                </Button>
                <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-sm py-2.5 sm:py-3 px-6">
                  View API Docs
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Daily Volume", value: "$100B+" },
                { label: "Bank Partners", value: "50+" },
                { label: "ERP Integrations", value: "20+" },
                { label: "Uptime SLA", value: "99.99%" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 sm:p-4 rounded-xl bg-white/10 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-teal-200 mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CorporateCashManagement;
