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
    color: "bg-amber-500",
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
        "relative group p-6 rounded-2xl bg-white border border-neutral-200",
        "hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4",
        loan.color
      )}>
        {loan.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{loan.name}</h3>
      <p className="text-sm text-neutral-500 mb-4">{loan.description}</p>

      {/* Rate & Details */}
      <div className="grid grid-cols-3 gap-3 py-4 border-y border-neutral-100 mb-4">
        <div>
          <p className="text-xs text-neutral-400">Rate from</p>
          <p className="text-lg font-bold text-neutral-900">{loan.rateFrom}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">Max Amount</p>
          <p className="text-sm font-semibold text-neutral-700">{loan.maxAmount}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">Max Term</p>
          <p className="text-sm font-semibold text-neutral-700">{loan.maxTerm}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {loan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
            <Check className="w-4 h-4 text-emerald-500" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex gap-3">
        <Button variant="primary" size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          Apply Now
        </Button>
        <Button variant="outline" size="sm">
          <Calculator className="w-4 h-4" />
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
      className="bg-indigo-900 rounded-2xl p-6 lg:p-8 text-white"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-white/10">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Loan Calculator</h3>
          <p className="text-sm text-indigo-200">Estimate your monthly payments</p>
        </div>
      </div>

      {/* Loan Amount */}
      <div className="mb-6">
        <label className="block text-sm text-indigo-200 mb-2">Loan Amount</label>
        <input
          type="range"
          min="5000"
          max="500000"
          step="5000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
        <p className="text-2xl font-bold mt-2">${amount.toLocaleString()}</p>
      </div>

      {/* Term */}
      <div className="mb-6">
        <label className="block text-sm text-indigo-200 mb-2">Term (months)</label>
        <input
          type="range"
          min="12"
          max="84"
          step="12"
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
        <p className="text-2xl font-bold mt-2">{term} months</p>
      </div>

      {/* Result */}
      <div className="p-4 rounded-xl bg-white/10 mb-6">
        <p className="text-sm text-indigo-200 mb-1">Estimated Monthly Payment</p>
        <p className="text-4xl font-bold text-amber-400">
          ${payment.toFixed(2)}
        </p>
        <p className="text-xs text-indigo-300 mt-2">
          *Based on {rate}% APR. Actual rate may vary.
        </p>
      </div>

      <Button variant="primary" className="w-full bg-amber-500 hover:bg-amber-600">
        Get Pre-Approved
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const Loans: React.FC = () => {
  return (
    <Section id="loans" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Personal Loans
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Flexible Loan Solutions For Every Need
          </h2>
          <p className="text-lg text-neutral-600">
            Whether you're buying a home, car, or funding your education, we offer 
            competitive rates and flexible terms to help you achieve your goals.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {loanBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-neutral-50"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{benefit.description}</p>
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
