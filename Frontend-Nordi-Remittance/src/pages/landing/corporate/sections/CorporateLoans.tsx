// ============================================================================
// CORPORATE LOANS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Building2,
  Factory,
  Truck,
  ArrowRight,
  Check,
  Calculator,
  Clock,
  Shield,
  TrendingUp,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CORPORATE LOAN PRODUCTS
// ========================
interface LoanProduct {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  amount: string;
  tenor: string;
  rate: string;
  features: string[];
  color: string;
}

const loanProducts: LoanProduct[] = [
  {
    id: "term-loan",
    name: "Corporate Term Loans",
    description: "Long-term financing for capital expenditure and expansion",
    icon: <Landmark className="w-6 h-6" />,
    amount: "$5M - $100M+",
    tenor: "3 - 10 years",
    rate: "From 12.5%",
    features: [
      "Flexible repayment structures",
      "Grace periods available",
      "Fixed or floating rates",
      "Collateral optimization",
    ],
    color: "bg-blue-500",
  },
  {
    id: "working-capital",
    name: "Working Capital Facility",
    description: "Revolving credit for operational liquidity needs",
    icon: <TrendingUp className="w-6 h-6" />,
    amount: "$1M - $50M",
    tenor: "1 - 3 years",
    rate: "From 13.0%",
    features: [
      "Revolving structure",
      "Flexible drawdown",
      "Seasonal adjustments",
      "Quick turnaround",
    ],
    color: "bg-emerald-500",
  },
  {
    id: "asset-finance",
    name: "Asset Finance",
    description: "Financing for equipment, machinery, and fleet",
    icon: <Factory className="w-6 h-6" />,
    amount: "$500K - $25M",
    tenor: "2 - 7 years",
    rate: "From 11.5%",
    features: [
      "Up to 85% financing",
      "Lease or loan options",
      "Vendor partnerships",
      "Residual value options",
    ],
    color: "bg-amber-50 dark:bg-amber-900/200",
  },
  {
    id: "commercial-mortgage",
    name: "Commercial Mortgage",
    description: "Financing for commercial property acquisition",
    icon: <Building2 className="w-6 h-6" />,
    amount: "$2M - $75M",
    tenor: "5 - 15 years",
    rate: "From 11.0%",
    features: [
      "Up to 70% LTV",
      "Owner-occupied or investment",
      "Construction finance",
      "Refinancing available",
    ],
    color: "bg-violet-500",
  },
];

// ========================
// PROCESS STEPS
// ========================
const processSteps = [
  { step: 1, title: "Initial Consultation", duration: "Day 1" },
  { step: 2, title: "Credit Assessment", duration: "Days 2-5" },
  { step: 3, title: "Term Sheet Issuance", duration: "Day 6" },
  { step: 4, title: "Documentation", duration: "Days 7-10" },
  { step: 5, title: "Disbursement", duration: "Day 11" },
];

// ========================
// MAIN COMPONENT
// ========================
const CorporateLoans: React.FC = () => {
  return (
    <Section id="corporate-loans" className="py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-4">
            <Landmark className="w-4 h-4" />
            Corporate Loans
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Financing Your Growth Ambitions
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Comprehensive lending solutions tailored for large corporations, 
            from working capital to long-term project financing.
          </p>
        </motion.div>

        {/* Loan Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {loanProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 transition-all duration-300"
              )}
            >
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", product.color)}>
                {product.icon}
              </div>

              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{product.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{product.description}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 mb-4">
                <div className="text-center">
                  <p className="text-xs text-neutral-400 mb-1">Amount</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{product.amount}</p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-xs text-neutral-400 mb-1">Tenor</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{product.tenor}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-400 mb-1">Rate</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{product.rate}</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full">
                Request Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-slate-900 text-white"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Streamlined Approval Process</h3>
              <p className="text-slate-300 mb-6">
                Our dedicated corporate banking team ensures quick turnaround times 
                with a structured and transparent approval process.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Fast Processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Confidential</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Competitive Rates</span>
                </div>
              </div>
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700">
                Start Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Timeline */}
            <div className="hidden lg:block">
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700" />
                {processSteps.map((step, index) => (
                  <div key={step.step} className="relative pb-6 last:pb-0">
                    <div className="absolute left-0 w-6 h-6 -translate-x-1/2 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                    <div className="ml-6">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs text-slate-400">{step.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CorporateLoans;
