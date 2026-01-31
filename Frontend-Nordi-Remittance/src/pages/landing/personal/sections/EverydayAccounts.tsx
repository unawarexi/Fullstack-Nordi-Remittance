// ============================================================================
// EVERYDAY ACCOUNTS SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Smartphone,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// EVERYDAY ACCOUNTS DATA
// ========================
interface EverydayAccount {
  id: string;
  name: string;
  description: string;
  monthlyFee: string;
  features: string[];
  highlights: string[];
  icon: React.ReactNode;
  color: string;
}

const everydayAccounts: EverydayAccount[] = [
  {
    id: "basic-checking",
    name: "Basic Checking",
    description: "Simple, no-frills banking for everyday transactions",
    monthlyFee: "$0",
    icon: <Wallet className="w-6 h-6" />,
    color: "bg-slate-500",
    features: [
      "No minimum balance requirement",
      "Free online and mobile banking",
      "Free debit card included",
      "Bill pay and transfers",
      "5 free ATM withdrawals/month",
    ],
    highlights: ["No Monthly Fee", "Easy Setup"],
  },
  {
    id: "premium-checking",
    name: "Premium Checking",
    description: "Enhanced features for active banking customers",
    monthlyFee: "$12",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-indigo-500",
    features: [
      "Unlimited ATM fee rebates",
      "Free checks and money orders",
      "Overdraft protection",
      "Interest on balances over $5,000",
      "Priority customer service",
      "Free wire transfers (domestic)",
    ],
    highlights: ["ATM Fee Rebates", "Earns Interest"],
  },
  {
    id: "digital-checking",
    name: "Digital Checking",
    description: "Modern banking designed for the digital age",
    monthlyFee: "$0",
    icon: <Smartphone className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Instant account opening",
      "Real-time spending insights",
      "Automated savings features",
      "Early direct deposit",
      "Virtual card numbers",
      "Spending categories & budgeting",
    ],
    highlights: ["100% Digital", "Smart Features"],
  },
];

// ========================
// FEATURES HIGHLIGHT
// ========================
const accountFeatures = [
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send money instantly to friends and family",
  },
  {
    icon: Shield,
    title: "Secure Banking",
    description: "Bank-grade security for all transactions",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Use your card anywhere in the world",
  },
  {
    icon: QrCode,
    title: "QR Payments",
    description: "Pay merchants with a quick scan",
  },
  {
    icon: RefreshCw,
    title: "Auto Savings",
    description: "Round up purchases to save automatically",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Full banking from your smartphone",
  },
];

// ========================
// ACCOUNT CARD COMPONENT
// ========================
interface AccountCardProps {
  account: EverydayAccount;
  index: number;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, index }) => (
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
    {/* Header */}
    <div className="flex items-start gap-4 mb-4">
      <div className={cn("p-3 rounded-xl text-white", account.color)}>
        {account.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {account.highlights.map((highlight) => (
            <span
              key={highlight}
              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded"
            >
              {highlight}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mt-2">{account.name}</h3>
      </div>
    </div>

    {/* Description */}
    <p className="text-sm text-neutral-500 mb-4">{account.description}</p>

    {/* Monthly Fee */}
    <div className="py-3 border-y border-neutral-100 mb-4">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-neutral-900">{account.monthlyFee}</span>
        <span className="text-sm text-neutral-500">/month</span>
      </div>
      {account.monthlyFee !== "$0" && (
        <p className="text-xs text-neutral-400 mt-1">
          Waived with $5,000 min. balance
        </p>
      )}
    </div>

    {/* Features */}
    <ul className="space-y-2.5 flex-1 mb-6">
      {account.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">
      Open Account
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const EverydayAccounts: React.FC = () => {
  return (
    <Section id="everyday-accounts" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-4">
            <Wallet className="w-4 h-4" />
            Everyday Accounts
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Banking Made Simple For Everyday Life
          </h2>
          <p className="text-lg text-neutral-600">
            Open an account in minutes and enjoy seamless banking with no hidden fees, 
            powerful digital tools, and 24/7 access to your money.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {accountFeatures.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-4 rounded-xl bg-white border border-neutral-200"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                <feature.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-xs">{feature.title}</p>
            </div>
          ))}
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {everydayAccounts.map((account, index) => (
            <AccountCard key={account.id} account={account} index={index} />
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-indigo-50 border border-indigo-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-neutral-900">
                Already have a bank account elsewhere?
              </h3>
              <p className="text-sm text-neutral-600">
                Switch to Nordea in minutes. We'll help you transfer everything seamlessly.
              </p>
            </div>
            <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
              Start Switch Process
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default EverydayAccounts;
