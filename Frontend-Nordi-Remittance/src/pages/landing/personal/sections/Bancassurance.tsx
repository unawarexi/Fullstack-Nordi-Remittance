// ============================================================================
// BANCASSURANCE SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Heart,
  Home,
  Car,
  Plane,
  Umbrella,
  ArrowRight,
  Check,
  Phone,
  FileText,
  Clock,
  Award,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// INSURANCE PRODUCTS DATA
// ========================
interface InsuranceProduct {
  id: string;
  name: string;
  description: string;
  startingFrom: string;
  coverage: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const insuranceProducts: InsuranceProduct[] = [
  {
    id: "life",
    name: "Life Insurance",
    description: "Protect your loved ones' financial future",
    startingFrom: "$15/mo",
    coverage: "Up to $1M",
    icon: <Heart className="w-6 h-6" />,
    color: "bg-rose-500",
    features: [
      "Term and whole life options",
      "Flexible coverage amounts",
      "No medical exam options",
      "Beneficiary protection",
      "Cash value accumulation",
    ],
  },
  {
    id: "health",
    name: "Health Insurance",
    description: "Comprehensive medical coverage for you and family",
    startingFrom: "$99/mo",
    coverage: "Full Medical",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "Hospitalization coverage",
      "Outpatient benefits",
      "Prescription drug coverage",
      "Dental and vision options",
      "Worldwide emergency coverage",
    ],
  },
  {
    id: "home",
    name: "Home Insurance",
    description: "Protect your home and belongings",
    startingFrom: "$45/mo",
    coverage: "Full Replacement",
    icon: <Home className="w-6 h-6" />,
    color: "bg-amber-500",
    features: [
      "Dwelling coverage",
      "Personal property protection",
      "Liability coverage",
      "Natural disaster protection",
      "Temporary living expenses",
    ],
  },
  {
    id: "auto",
    name: "Auto Insurance",
    description: "Complete protection for your vehicle",
    startingFrom: "$35/mo",
    coverage: "Comprehensive",
    icon: <Car className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Collision coverage",
      "Comprehensive protection",
      "Roadside assistance",
      "Rental car coverage",
      "Multi-vehicle discounts",
    ],
  },
  {
    id: "travel",
    name: "Travel Insurance",
    description: "Peace of mind for every journey",
    startingFrom: "$8/trip",
    coverage: "Global Coverage",
    icon: <Plane className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "Trip cancellation protection",
      "Medical emergency coverage",
      "Lost baggage reimbursement",
      "Flight delay compensation",
      "24/7 emergency assistance",
    ],
  },
  {
    id: "umbrella",
    name: "Umbrella Insurance",
    description: "Extra liability protection beyond standard policies",
    startingFrom: "$20/mo",
    coverage: "$1M+",
    icon: <Umbrella className="w-6 h-6" />,
    color: "bg-indigo-500",
    features: [
      "Extended liability limits",
      "Lawsuit protection",
      "Asset protection",
      "Worldwide coverage",
      "Affordable premiums",
    ],
  },
];

// ========================
// INSURANCE BENEFITS
// ========================
const insuranceBenefits = [
  {
    icon: Clock,
    title: "Quick Claims",
    description: "Most claims processed within 24-48 hours",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Expert help available around the clock",
  },
  {
    icon: FileText,
    title: "Easy Application",
    description: "Simple online process, no paperwork",
  },
  {
    icon: Award,
    title: "Top Rated",
    description: "A+ rated insurance partners",
  },
];

// ========================
// INSURANCE CARD COMPONENT
// ========================
interface InsuranceCardProps {
  product: InsuranceProduct;
  index: number;
}

const InsuranceCard: React.FC<InsuranceCardProps> = ({ product, index }) => (
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
      <div className={cn("p-2.5 rounded-lg text-white", product.color)}>
        {product.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-neutral-900">{product.name}</h3>
        <p className="text-xs text-neutral-500">{product.description}</p>
      </div>
    </div>

    {/* Pricing */}
    <div className="flex items-baseline gap-2 py-3 border-y border-neutral-100 mb-3">
      <span className="text-2xl font-bold text-neutral-900">{product.startingFrom}</span>
      <span className="text-xs text-neutral-400">Coverage: {product.coverage}</span>
    </div>

    {/* Features */}
    <ul className="space-y-1.5 flex-1 mb-4">
      {product.features.slice(0, 4).map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-neutral-600">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="outline" size="sm" className="w-full">
      Get Quote
      <ArrowRight className="w-3 h-3 ml-1" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const Bancassurance: React.FC = () => {
  return (
    <Section id="bancassurance" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Bancassurance
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Protect What Matters Most
          </h2>
          <p className="text-lg text-neutral-600">
            Comprehensive insurance solutions through our trusted partners. 
            Get coverage for life, health, home, and more - all managed through your banking account.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {insuranceBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-neutral-50"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Insurance Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {insuranceProducts.map((product, index) => (
            <InsuranceCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Bundle CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-rose-50 border border-rose-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                Bundle & Save Up to 25%
              </h3>
              <p className="text-sm text-neutral-600">
                Combine multiple insurance products and enjoy exclusive discounts as a Nordea customer.
              </p>
            </div>
            <Button variant="primary" className="bg-rose-600 hover:bg-rose-700 whitespace-nowrap">
              Get Bundle Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Bancassurance;
