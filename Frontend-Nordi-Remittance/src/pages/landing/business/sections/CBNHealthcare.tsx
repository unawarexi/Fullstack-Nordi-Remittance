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
    color: "bg-amber-500",
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
      "relative flex flex-col h-full p-6 rounded-2xl bg-white border border-neutral-200",
      "hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", loan.color)}>
      {loan.icon}
    </div>

    {/* Content */}
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{loan.name}</h3>
    <p className="text-sm text-neutral-500 mb-4">{loan.description}</p>

    {/* Loan Details */}
    <div className="grid grid-cols-3 gap-3 py-4 border-y border-neutral-100 mb-4">
      <div>
        <p className="text-xs text-neutral-400">Max Amount</p>
        <p className="text-lg font-bold text-neutral-900">{loan.maxAmount}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">Rate</p>
        <p className="text-lg font-bold text-emerald-600">{loan.rate}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">Tenure</p>
        <p className="text-lg font-bold text-neutral-900">{loan.tenure}</p>
      </div>
    </div>

    {/* Eligible For */}
    <div className="flex-1 mb-6">
      <p className="text-xs font-semibold text-neutral-400 uppercase mb-2">Eligible Businesses</p>
      <div className="flex flex-wrap gap-2">
        {loan.eligibleFor.map((item) => (
          <span
            key={item}
            className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded"
          >
            {item}
          </span>
        ))}
      </div>
    </div>

    {/* CTA */}
    <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700">
      Apply Now
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const CBNHealthcare: React.FC = () => {
  return (
    <Section id="cbn-healthcare" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Healthcare Sector Intervention
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            CBN Healthcare Sector Loan
          </h2>
          <p className="text-lg text-neutral-600">
            Access concessionary financing through the Central Bank's Healthcare 
            Sector Intervention Fund to grow your healthcare business.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {programBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-white border border-neutral-200"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{benefit.description}</p>
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
          className="p-6 rounded-2xl bg-blue-900 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Eligibility Requirements</h3>
              <p className="text-blue-200 mb-6">
                To qualify for the CBN Healthcare Sector Intervention Fund, your 
                business must meet the following criteria:
              </p>
              <ul className="space-y-3">
                {eligibilityCriteria.map((criteria) => (
                  <li key={criteria} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/90">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-400 mb-2">$50M+</p>
              <p className="text-blue-200 mb-6">Total funds disbursed to healthcare sector</p>
              <Button variant="primary" size="lg" className="bg-amber-500 hover:bg-amber-600">
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
