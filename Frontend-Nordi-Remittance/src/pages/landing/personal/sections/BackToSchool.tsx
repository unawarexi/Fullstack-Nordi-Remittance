// ============================================================================
// BACK TO SCHOOL SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Laptop,
  CreditCard,
  PiggyBank,
  ArrowRight,
  Check,
  Calendar,
  Gift,
  Percent,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// BACK TO SCHOOL OFFERS
// ========================
interface SchoolOffer {
  id: string;
  title: string;
  description: string;
  savings: string;
  validUntil: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const schoolOffers: SchoolOffer[] = [
  {
    id: "student-account",
    title: "Student Checking Bundle",
    description: "Everything a student needs for campus life",
    savings: "Save $150",
    validUntil: "Sept 30",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "No monthly fees through graduation",
      "Free debit card with custom design",
      "$50 bonus on first direct deposit",
      "Free 500 checks",
    ],
  },
  {
    id: "laptop-loan",
    title: "Tech & Laptop Loan",
    description: "Finance your study essentials at 0% APR",
    savings: "0% APR",
    validUntil: "Oct 15",
    icon: <Laptop className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "0% APR for 12 months",
      "Up to $3,000 financing",
      "No collateral required",
      "Fast approval process",
    ],
  },
  {
    id: "parents-savings",
    title: "Education Savings Plan",
    description: "Help parents save for their children's education",
    savings: "5.0% APY",
    validUntil: "Ongoing",
    icon: <PiggyBank className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Tax-advantaged savings",
      "Competitive interest rates",
      "Flexible contribution amounts",
      "Use at any accredited school",
    ],
  },
  {
    id: "student-credit",
    title: "Student Credit Builder",
    description: "Build credit responsibly while in school",
    savings: "$100 Bonus",
    validUntil: "Dec 31",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-amber-500",
    features: [
      "Low credit limit to start",
      "No annual fee ever",
      "Free credit score monitoring",
      "Automatic limit increases",
    ],
  },
];

// ========================
// SCHOOL CHECKLIST
// ========================
const schoolChecklist = [
  { item: "Open a student checking account", priority: "Essential" },
  { item: "Set up direct deposit for part-time job", priority: "Recommended" },
  { item: "Get a student credit card", priority: "Build Credit" },
  { item: "Create a monthly budget", priority: "Smart Money" },
  { item: "Set up automatic savings", priority: "Future You" },
];

// ========================
// OFFER CARD COMPONENT
// ========================
interface OfferCardProps {
  offer: SchoolOffer;
  index: number;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, index }) => (
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
    {/* Savings Badge */}
    <div className="absolute -top-3 right-6">
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
        {offer.savings}
      </span>
    </div>

    {/* Icon */}
    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", offer.color)}>
      {offer.icon}
    </div>

    {/* Content */}
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{offer.title}</h3>
    <p className="text-sm text-neutral-500 mb-4">{offer.description}</p>

    {/* Valid Until */}
    <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
      <Calendar className="w-3 h-3" />
      Valid until: {offer.validUntil}
    </div>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {offer.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">
      Learn More
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const BackToSchool: React.FC = () => {
  return (
    <Section id="back-to-school" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Back to School
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Start The School Year Right With Smart Banking
          </h2>
          <p className="text-lg text-neutral-600">
            Special offers for students and parents to make this academic year 
            financially stress-free. Limited time offers available now!
          </p>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {schoolOffers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} index={index} />
          ))}
        </div>

        {/* Financial Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Checklist */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-500" />
              Student Financial Checklist
            </h3>
            <ul className="space-y-3">
              {schoolChecklist.map((item, index) => (
                <li
                  key={item.item}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-300 flex items-center justify-center text-xs font-bold text-neutral-400">
                      {index + 1}
                    </div>
                    <span className="text-sm text-neutral-700">{item.item}</span>
                  </div>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                    {item.priority}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="p-6 rounded-2xl bg-indigo-900 text-white">
            <h3 className="text-xl font-semibold mb-6">Why Students Choose Nordea</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-4xl font-bold text-amber-400">500K+</p>
                <p className="text-sm text-indigo-200">Student accounts opened</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-400">$0</p>
                <p className="text-sm text-indigo-200">Monthly fees for students</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-400">3,000+</p>
                <p className="text-sm text-indigo-200">Campus ATM locations</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-400">4.8★</p>
                <p className="text-sm text-indigo-200">App store rating</p>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-6 bg-amber-500 hover:bg-amber-600">
              Open Student Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default BackToSchool;
