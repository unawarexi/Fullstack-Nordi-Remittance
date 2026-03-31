// ============================================================================
// CBN HEALTHCARE SECTOR LOAN SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Hospital,
  Stethoscope,
  Pill,
  Building,
  ArrowRight,
  Check,
  Clock,
  Percent,
  Shield,
  FileText,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// LOAN CATEGORIES
// ========================
interface LoanCategory {
  id: string;
  name: string;
  description: string;
  maxAmount: string;
  rate: string;
  tenure: string;
  icon: React.ReactNode;
  color: string;
  eligibleFor: string[];
}

const loanCategories: LoanCategory[] = [
  {
    id: "hospital",
    name: "Hospital Infrastructure",
    description: "Fund construction, expansion, or renovation of healthcare facilities",
    maxAmount: "$10M",
    rate: "5.0%",
    tenure: "15 years",
    icon: <Hospital className="w-6 h-6" />,
    color: "bg-blue-500",
    eligibleFor: [
      "Hospitals & Clinics",
      "Diagnostic Centers",
      "Specialist Centers",
    ],
  },
  {
    id: "equipment",
    name: "Medical Equipment",
    description: "Acquire cutting-edge medical equipment and technology",
    maxAmount: "$5M",
    rate: "6.0%",
    tenure: "7 years",
    icon: <Stethoscope className="w-6 h-6" />,
    color: "bg-emerald-500",
    eligibleFor: [
      "Imaging Equipment",
      "Laboratory Equipment",
      "Surgical Equipment",
    ],
  },
  {
    id: "pharma",
    name: "Pharmaceutical",
    description: "Working capital for drug manufacturing and distribution",
    maxAmount: "$3M",
    rate: "5.5%",
    tenure: "5 years",
    icon: <Pill className="w-6 h-6" />,
    color: "bg-violet-500",
    eligibleFor: [
      "Drug Manufacturers",
      "Wholesale Distributors",
      "Retail Pharmacies",
    ],
  },
  {
    id: "healthcare-re",
    name: "Healthcare Real Estate",
    description: "Develop or acquire healthcare-related properties",
    maxAmount: "$15M",
    rate: "5.5%",
    tenure: "20 years",
    icon: <Building className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    eligibleFor: [
      "Medical Office Buildings",
      "Senior Care Facilities",
      "Rehabilitation Centers",
    ],
  },
];

// ========================
// PROGRAM BENEFITS
// ========================
const programBenefits = [
  { icon: Percent, title: "Low Interest Rates", description: "Starting from 5% per annum" },
  { icon: Clock, title: "Long Tenure", description: "Up to 20 years repayment" },
  { icon: Shield, title: "Government Backed", description: "CBN intervention fund" },
  { icon: FileText, title: "Easy Documentation", description: "Simplified application" },
];

// ========================
// ELIGIBILITY CRITERIA
// ========================
const eligibilityCriteria = [
  "Must be a registered healthcare business in Nigeria",
  "Minimum 2 years operational history",
  "Valid licenses and regulatory approvals",
  "Good credit history with no defaults",
  "Must have audited financial statements",
  "Willingness to provide collateral security",
];

// ========================
// LOAN CARD COMPONENT
// ========================
interface LoanCardProps {
  loan: LoanCategory;
  index: number;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 shrink-0 shadow-md", loan.color)}>
      {React.isValidElement(loan.icon) 
        ? React.cloneElement(loan.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
        : loan.icon}
    </div>

    {/* Content */}
    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 leading-tight">{loan.name}</h3>
    <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-4 leading-tight">{loan.description}</p>

    {/* Loan Details */}
    <div className="grid grid-cols-3 gap-2 py-3 sm:py-5 border-y border-neutral-100 dark:border-neutral-700 mb-4 sm:mb-5">
      <div>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold leading-tight mb-0.5">Max Amount</p>
        <p className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-tight">{loan.maxAmount}</p>
      </div>
      <div>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold leading-tight mb-0.5">Rate</p>
        <p className="text-base sm:text-lg font-black text-emerald-600 leading-tight">{loan.rate}</p>
      </div>
      <div>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold leading-tight mb-0.5">Tenure</p>
        <p className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-tight">{loan.tenure}</p>
      </div>
    </div>

    {/* Eligible For */}
    <div className="flex-1 mb-6 sm:mb-8">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 sm:mb-3">Eligible Businesses</p>
      <div className="flex flex-wrap gap-2">
        {loan.eligibleFor.map((item) => (
          <span
            key={item}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-300 text-[10px] sm:text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800/30"
          >
            {item}
          </span>
        ))}
      </div>
    </div>

    {/* CTA */}
    <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2.5 sm:py-3 font-bold shadow-md">
      Apply Now
      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const CBNHealthcare: React.FC = () => {
  return (
    <Section id="cbn-healthcare" background="light" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Healthcare Sector Intervention
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            CBN Healthcare Sector Loan
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Access concessionary financing through the Central Bank's Healthcare 
            Sector Intervention Fund to grow your healthcare business.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {programBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 sm:mb-3">
                <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white text-[13px] sm:text-sm leading-tight">{benefit.title}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 leading-tight">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Loan Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loanCategories.map((loan, index) => (
            <LoanCard key={loan.id} loan={loan} index={index} />
          ))}
        </div>

        {/* Eligibility Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-10 rounded-3xl bg-blue-900 text-white border border-blue-800 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight">Eligibility Requirements</h3>
              <p className="text-sm sm:text-lg text-blue-200 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                To qualify for the CBN Healthcare Sector Intervention Fund, your 
                business must meet the following core criteria:
              </p>
              <ul className="space-y-3 sm:space-y-4">
                {eligibilityCriteria.map((criteria) => (
                  <li key={criteria} className="flex items-start gap-3 sm:gap-4 font-medium">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-[13px] sm:text-base text-white/90 leading-snug">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center bg-white/5 p-8 sm:p-12 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
              </div>
              <p className="text-3xl sm:text-5xl font-black text-amber-400 mb-2 sm:mb-3 leading-tight tracking-tighter">$50M+</p>
              <p className="text-sm sm:text-lg text-blue-200 mb-8 sm:mb-10 font-bold leading-tight">Total funds disbursed to Nigeria's healthcare sector</p>
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-blue-900 font-bold px-10 py-4 shadow-xl">
                Check Your Eligibility
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CBNHealthcare;
