// ============================================================================
// E-SOLUTIONS & SERVICES SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  CreditCard,
  ShoppingCart,
  QrCode,
  Smartphone,
  Link2,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// E-SOLUTIONS DATA
// ========================
interface ESolution {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  transactionFee: string;
}

const eSolutions: ESolution[] = [
  {
    id: "payment-gateway",
    name: "Payment Gateway",
    description: "Accept online payments on your website or app",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-indigo-50 dark:bg-indigo-900/300",
    transactionFee: "1.5%",
    features: [
      "Multiple payment methods",
      "Real-time transaction reporting",
      "Fraud detection & prevention",
      "PCI DSS compliant",
      "Custom checkout experience",
    ],
  },
  {
    id: "pos-solutions",
    name: "POS Solutions",
    description: "Accept card payments at your physical location",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-emerald-500",
    transactionFee: "0.75%",
    features: [
      "Countertop & mobile POS",
      "Contactless payments",
      "Split payment support",
      "Inventory integration",
      "Real-time sales dashboard",
    ],
  },
  {
    id: "ecommerce",
    name: "E-Commerce Integration",
    description: "Seamless payment plugins for popular platforms",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "bg-violet-500",
    transactionFee: "1.8%",
    features: [
      "Shopify, WooCommerce, Magento",
      "One-click checkout",
      "Recurring billing",
      "Cart recovery tools",
      "Multi-currency support",
    ],
  },
  {
    id: "qr-payments",
    name: "QR Payment Solutions",
    description: "Enable quick payments via QR code scanning",
    icon: <QrCode className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    transactionFee: "0.5%",
    features: [
      "Static & dynamic QR codes",
      "No hardware required",
      "Instant settlement",
      "Customer analytics",
      "Promotional campaigns",
    ],
  },
  {
    id: "ussd",
    name: "USSD Payment",
    description: "Accept payments without internet connection",
    icon: <Smartphone className="w-6 h-6" />,
    color: "bg-rose-500",
    transactionFee: "0.5%",
    features: [
      "Works on any phone",
      "No internet required",
      "Simple payment codes",
      "Bill payment integration",
      "Airtime & data vending",
    ],
  },
  {
    id: "api",
    name: "Payment APIs",
    description: "Build custom payment experiences with our APIs",
    icon: <Link2 className="w-6 h-6" />,
    color: "bg-slate-50 dark:bg-neutral-9000",
    transactionFee: "Custom",
    features: [
      "RESTful APIs",
      "Webhooks & callbacks",
      "Sandbox environment",
      "Detailed documentation",
      "Developer support",
    ],
  },
];

// ========================
// BENEFITS
// ========================
const benefits = [
  { icon: Zap, title: "Instant Settlement", description: "Same-day fund transfers" },
  { icon: Shield, title: "Secure & Compliant", description: "PCI DSS Level 1" },
  { icon: BarChart3, title: "Real-time Analytics", description: "Track every transaction" },
];

// ========================
// SOLUTION CARD COMPONENT
// ========================
interface SolutionCardProps {
  solution: ESolution;
  index: number;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className={cn(
      "relative flex flex-col h-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Header */}
    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
      <div className={cn("p-2.5 sm:p-3 rounded-xl text-white shadow-sm shrink-0", solution.color)}>
        {React.isValidElement(solution.icon) 
          ? React.cloneElement(solution.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
          : solution.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">{solution.name}</h3>
        <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 leading-tight mt-1">{solution.description}</p>
      </div>
    </div>

    {/* Transaction Fee */}
    <div className="py-3 sm:py-4 border-y border-neutral-100 dark:border-neutral-700 mb-3 sm:mb-4">
      <p className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Transaction Fee</p>
      <div className="flex items-baseline gap-1">
        <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">{solution.transactionFee}</p>
        <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">per transaction</p>
      </div>
    </div>

    {/* Features */}
    <ul className="space-y-1.5 sm:space-y-2 flex-1 mb-6 sm:mb-8">
      {solution.features.slice(0, 4).map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="outline" size="lg" className="w-full text-sm py-2.5 sm:py-3 font-bold group">
      Learn More
      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const ESolutions: React.FC = () => {
  return (
    <Section id="e-solutions" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            E-Solutions & Services
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Digital Payment Solutions For Your Business
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Accept payments online, in-store, and on-the-go with our comprehensive 
            suite of e-payment solutions designed for modern businesses.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-16"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white text-base sm:text-lg leading-tight mb-1">{benefit.title}</p>
                <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 leading-tight">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {eSolutions.map((solution, index) => (
            <SolutionCard key={solution.id} solution={solution} index={index} />
          ))}
        </div>

        {/* Integration CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-20 text-center p-8 sm:p-12 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full -ml-16 -mb-16 blur-2xl" />
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4 leading-tight">
              Ready to Start Accepting Payments?
            </h3>
            <p className="text-sm sm:text-xl text-neutral-600 dark:text-neutral-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Our specialized integration team will help you set up the perfect payment solution 
              for your business in as little as 24 hours. No hidden fees, no stress.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-base py-4 px-10 font-bold shadow-lg">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base py-4 px-10 font-bold border-2">
                View API Docs
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default ESolutions;
