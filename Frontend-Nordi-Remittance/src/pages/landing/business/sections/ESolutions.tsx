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
    color: "bg-indigo-500",
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
    color: "bg-amber-500",
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
    color: "bg-slate-500",
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
      "relative flex flex-col h-full p-5 rounded-xl bg-white border border-neutral-200",
      "hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Header */}
    <div className="flex items-start gap-3 mb-3">
      <div className={cn("p-2.5 rounded-lg text-white", solution.color)}>
        {solution.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-neutral-900">{solution.name}</h3>
        <p className="text-xs text-neutral-500">{solution.description}</p>
      </div>
    </div>

    {/* Transaction Fee */}
    <div className="py-3 border-y border-neutral-100 mb-3">
      <p className="text-xs text-neutral-400">Transaction Fee</p>
      <p className="text-xl font-bold text-neutral-900">{solution.transactionFee}</p>
    </div>

    {/* Features */}
    <ul className="space-y-1.5 flex-1 mb-4">
      {solution.features.slice(0, 4).map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-neutral-600">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="outline" size="sm" className="w-full">
      Learn More
      <ArrowRight className="w-3 h-3 ml-1" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const ESolutions: React.FC = () => {
  return (
    <Section id="e-solutions" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            E-Solutions & Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Digital Payment Solutions For Your Business
          </h2>
          <p className="text-lg text-neutral-600">
            Accept payments online, in-store, and on-the-go with our comprehensive 
            suite of e-payment solutions designed for modern businesses.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100"
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <benefit.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
                <p className="text-xs text-neutral-500">{benefit.description}</p>
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
          className="mt-12 text-center p-6 rounded-2xl bg-neutral-50"
        >
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Ready to Start Accepting Payments?
          </h3>
          <p className="text-neutral-600 mb-6 max-w-xl mx-auto">
            Our integration team will help you set up the perfect payment solution 
            for your business in as little as 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              View API Docs
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default ESolutions;
