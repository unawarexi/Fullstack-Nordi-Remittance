// ============================================================================
// BUSINESS LOANS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Building2,
  Truck,
  Warehouse,
  CreditCard,
  ArrowRight,
  Check,
  Clock,
  Percent,
  Shield,
  Calculator,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// LOAN TYPES DATA
// ========================
interface BusinessLoan {
  id: string;
  name: string;
  description: string;
  amountRange: string;
  rateFrom: string;
  tenure: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const businessLoans: BusinessLoan[] = [
  {
    id: "working-capital",
    name: "Working Capital Loan",
    description: "Fund day-to-day operations and manage cash flow",
    amountRange: "$10K - $500K",
    rateFrom: "8.5%",
    tenure: "1-3 years",
    icon: <Banknote className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Quick approval process",
      "Flexible repayment terms",
      "No collateral up to $100K",
      "Revolving credit option",
    ],
  },
  {
    id: "asset-finance",
    name: "Asset Finance",
    description: "Finance equipment, machinery, and vehicles",
    amountRange: "$25K - $2M",
    rateFrom: "7.5%",
    tenure: "2-7 years",
    icon: <Truck className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "Up to 100% asset financing",
      "Hire purchase & leasing",
      "Tax-efficient structures",
      "Fleet financing available",
    ],
  },
  {
    id: "commercial-mortgage",
    name: "Commercial Mortgage",
    description: "Finance business property purchase or construction",
    amountRange: "$100K - $10M",
    rateFrom: "6.5%",
    tenure: "5-25 years",
    icon: <Building2 className="w-6 h-6" />,
    color: "bg-indigo-50 dark:bg-indigo-900/300",
    features: [
      "Competitive interest rates",
      "Up to 80% LTV",
      "Owner-occupied & investment",
      "Refinancing options",
    ],
  },
  {
    id: "trade-finance",
    name: "Trade Finance",
    description: "Support for import/export activities",
    amountRange: "$50K - $5M",
    rateFrom: "5.5%",
    tenure: "90-360 days",
    icon: <Warehouse className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    features: [
      "Letters of credit",
      "Documentary collections",
      "Trade guarantees",
      "Supply chain finance",
    ],
  },
  {
    id: "invoice-finance",
    name: "Invoice Finance",
    description: "Unlock cash tied up in unpaid invoices",
    amountRange: "Up to 90% of invoices",
    rateFrom: "1.5% per month",
    tenure: "Ongoing facility",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "Same-day funding",
      "Confidential facility available",
      "No long-term contracts",
      "Credit control support",
    ],
  },
];

// ========================
// LOAN BENEFITS
// ========================
const loanBenefits = [
  { icon: Clock, title: "Fast Approval", description: "Decision within 48 hours" },
  { icon: Percent, title: "Competitive Rates", description: "From 5.5% APR" },
  { icon: Shield, title: "Flexible Terms", description: "Tailored to your needs" },
  { icon: Calculator, title: "Expert Advice", description: "Dedicated loan officers" },
];

// ========================
// LOAN CARD COMPONENT
// ========================
interface LoanCardProps {
  loan: BusinessLoan;
  index: number;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Header */}
    <div className="flex items-start gap-3 mb-2.5 sm:mb-3">
      <div className={cn("p-2 sm:p-2.5 rounded-lg text-white", loan.color)}>
        {React.cloneElement(loan.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
      </div>
      <div>
        <h3 className="text-[15px] sm:text-base font-semibold text-neutral-900 dark:text-white leading-tight">{loan.name}</h3>
        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 leading-tight">{loan.description}</p>
      </div>
    </div>

    {/* Loan Details */}
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-2.5 sm:py-3 border-y border-neutral-100 dark:border-neutral-700 mb-2.5 sm:mb-3">
      <div>
        <p className="text-[10px] text-neutral-400 leading-tight">Amount</p>
        <p className="text-[11px] sm:text-sm font-semibold text-neutral-900 dark:text-white leading-tight">{loan.amountRange}</p>
      </div>
      <div>
        <p className="text-[10px] text-neutral-400 leading-tight">Rate from</p>
        <p className="text-[11px] sm:text-sm font-semibold text-emerald-600 leading-tight">{loan.rateFrom}</p>
      </div>
      <div>
        <p className="text-[10px] text-neutral-400 leading-tight">Tenure</p>
        <p className="text-[11px] sm:text-sm font-semibold text-neutral-900 dark:text-white leading-tight">{loan.tenure}</p>
      </div>
    </div>

    {/* Features */}
    <ul className="space-y-1.5 flex-1 mb-4">
      {loan.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-neutral-600 dark:text-neutral-300">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="primary" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 py-1.5 sm:py-2 text-xs sm:text-sm">
      Apply Now
      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const BusinessLoans: React.FC = () => {
  return (
    <Section id="business-loans" background="light" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Loans for Businesses
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Financing Solutions For Every Business Need
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Access the capital you need to grow, expand, or manage cash flow with 
            our range of business financing options.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {loanBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 sm:mb-3">
                <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white text-[13px] sm:text-sm leading-tight">{benefit.title}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 leading-tight">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Loans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {businessLoans.map((loan, index) => (
            <LoanCard key={loan.id} loan={loan} index={index} />
          ))}
        </div>

        {/* Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 p-5 sm:p-6 rounded-2xl bg-emerald-900 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 text-center md:text-left">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/10 shrink-0">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold leading-tight">Business Loan Calculator</h3>
                <p className="text-[13px] sm:text-emerald-200 leading-tight mt-0.5">
                  Estimate your monthly payments and total cost of borrowing
                </p>
              </div>
            </div>
            <Button variant="primary" size="lg" className="w-full md:w-auto bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 whitespace-nowrap text-sm py-2">
              Calculate Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default BusinessLoans;
