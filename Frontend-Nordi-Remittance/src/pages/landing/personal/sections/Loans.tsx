// ============================================================================
// LOANS SECTION - Personal Banking
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Calculator,
  ArrowRight,
  Check,
  Clock,
  Percent,
  BadgeCheck,
  FileText,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// LOAN TYPES DATA
// ========================
interface LoanType {
  id: string;
  name: string;
  description: string;
  rateFrom: string;
  maxAmount: string;
  maxTerm: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const loanTypes: LoanType[] = [
  {
    id: "home",
    name: "Home Loan",
    description: "Make your dream home a reality with competitive mortgage rates",
    rateFrom: "5.99%",
    maxAmount: "$2,000,000",
    maxTerm: "30 years",
    icon: <Home className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "Fixed and variable rate options",
      "First-time buyer programs",
      "Refinancing available",
      "No hidden fees",
    ],
  },
  {
    id: "auto",
    name: "Auto Loan",
    description: "Drive your dream car with flexible financing options",
    rateFrom: "4.49%",
    maxAmount: "$150,000",
    maxTerm: "7 years",
    icon: <Car className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "New and used car financing",
      "Quick approval process",
      "Flexible repayment terms",
      "No prepayment penalties",
    ],
  },
  {
    id: "education",
    name: "Education Loan",
    description: "Invest in your future with affordable education financing",
    rateFrom: "3.99%",
    maxAmount: "$500,000",
    maxTerm: "15 years",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "Covers tuition and living expenses",
      "Grace period after graduation",
      "Multiple repayment options",
      "Study abroad eligible",
    ],
  },
  {
    id: "personal",
    name: "Personal Loan",
    description: "Flexible funding for any personal financial need",
    rateFrom: "6.99%",
    maxAmount: "$100,000",
    maxTerm: "7 years",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    features: [
      "No collateral required",
      "Fixed monthly payments",
      "Quick disbursement",
      "Use for any purpose",
    ],
  },
];

// ========================
// LOAN BENEFITS
// ========================
const loanBenefits = [
  {
    icon: Clock,
    title: "Quick Approval",
    description: "Get approved in as fast as 24 hours",
  },
  {
    icon: Percent,
    title: "Competitive Rates",
    description: "Industry-leading interest rates",
  },
  {
    icon: BadgeCheck,
    title: "Flexible Terms",
    description: "Choose repayment terms that work for you",
  },
  {
    icon: FileText,
    title: "Simple Process",
    description: "Easy online application and documentation",
  },
];

// ========================
// LOAN CARD COMPONENT
// ========================
interface LoanCardProps {
  loan: LoanType;
  index: number;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative group p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
        "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4",
        loan.color
      )}>
        {React.cloneElement(loan.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
      </div>

      {/* Content */}
      <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 leading-tight">{loan.name}</h3>
      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4 leading-tight">{loan.description}</p>

      {/* Rate & Details */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 sm:py-4 border-y border-neutral-100 dark:border-neutral-700 mb-3 sm:mb-4">
        <div>
          <p className="text-[10px] text-neutral-400">Rate from</p>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">{loan.rateFrom}</p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-400">Max Amount</p>
          <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">{loan.maxAmount}</p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-400">Max Term</p>
          <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">{loan.maxTerm}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
        {loan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex gap-2 sm:gap-3">
        <Button variant="primary" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-1.5 sm:py-2 text-xs sm:text-sm">
          Apply Now
        </Button>
        <Button variant="outline" className="px-2.5 sm:px-3 py-1.5 sm:py-2">
          <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// ========================
// LOAN CALCULATOR PREVIEW
// ========================
const LoanCalculatorPreview: React.FC = () => {
  const [amount, setAmount] = useState(50000);
  const [term, setTerm] = useState(60);
  const rate = 6.99;
  
  // Simple monthly payment calculation
  const monthlyRate = rate / 100 / 12;
  const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                  (Math.pow(1 + monthlyRate, term) - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-indigo-900 rounded-2xl p-5 sm:p-6 lg:p-8 text-white"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 rounded-xl bg-white/10">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">Loan Calculator</h3>
          <p className="text-xs sm:text-sm text-indigo-200">Estimate your monthly payments</p>
        </div>
      </div>

      {/* Loan Amount */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm text-indigo-200 mb-1.5 sm:mb-2">Loan Amount</label>
        <input
          type="range"
          min="5000"
          max="500000"
          step="5000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
        <p className="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2">${amount.toLocaleString()}</p>
      </div>

      {/* Term */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm text-indigo-200 mb-1.5 sm:mb-2">Term (months)</label>
        <input
          type="range"
          min="12"
          max="84"
          step="12"
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
        <p className="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2">{term} months</p>
      </div>

      {/* Result */}
      <div className="p-3 sm:p-4 rounded-xl bg-white/10 mb-4 sm:mb-6">
        <p className="text-[10px] sm:text-sm text-indigo-200 mb-1">Estimated Monthly Payment</p>
        <p className="text-3xl sm:text-4xl font-bold text-amber-400">
          ${payment.toFixed(2)}
        </p>
        <p className="text-[10px] text-indigo-300 mt-1.5 sm:mt-2">
          *Based on {rate}% APR. Actual rate may vary.
        </p>
      </div>

      <Button variant="primary" className="w-full bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 py-2 sm:py-2.5 text-sm">
        Get Pre-Approved
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
      </Button>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const Loans: React.FC = () => {
  return (
    <Section id="loans" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Personal Loans
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4">
            Flexible Loan Solutions For Every Need
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300">
            Whether you're buying a home, car, or funding your education, we offer 
            competitive rates and flexible terms to help you achieve your goals.
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
              className="text-center p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 flex items-center justify-center mb-2 sm:mb-3">
                <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white text-[13px] sm:text-sm">{benefit.title}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loan Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loanTypes.map((loan, index) => (
              <LoanCard key={loan.id} loan={loan} index={index} />
            ))}
          </div>

          {/* Calculator */}
          <div className="lg:col-span-1">
            <LoanCalculatorPreview />
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Loans;
