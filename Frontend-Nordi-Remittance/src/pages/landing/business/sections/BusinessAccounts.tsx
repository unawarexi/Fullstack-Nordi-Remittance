// ============================================================================
// BUSINESS ACCOUNTS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Briefcase,
  Store,
  Factory,
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// BUSINESS ACCOUNT TYPES
// ========================
interface BusinessAccount {
  id: string;
  name: string;
  tagline: string;
  monthlyFee: string;
  transactionLimit: string;
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  features: string[];
  idealFor: string;
}

const businessAccounts: BusinessAccount[] = [
  {
    id: "starter",
    name: "Business Starter",
    tagline: "Perfect for new businesses",
    monthlyFee: "$15",
    transactionLimit: "100/month",
    icon: <Store className="w-6 h-6" />,
    color: "bg-slate-500",
    idealFor: "Startups & Freelancers",
    features: [
      "Free business debit card",
      "Online & mobile banking",
      "100 free transactions/month",
      "Basic accounting integration",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Business Growth",
    tagline: "Scale your operations",
    monthlyFee: "$45",
    transactionLimit: "500/month",
    popular: true,
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-emerald-500",
    idealFor: "SMEs & Growing Businesses",
    features: [
      "Everything in Starter",
      "500 free transactions/month",
      "Multi-user access (5 users)",
      "Payroll services included",
      "Priority phone support",
      "Business credit card option",
    ],
  },
  {
    id: "enterprise",
    name: "Business Enterprise",
    tagline: "Full-featured business banking",
    monthlyFee: "$150",
    transactionLimit: "Unlimited",
    icon: <Building2 className="w-6 h-6" />,
    color: "bg-indigo-500",
    idealFor: "Large Businesses",
    features: [
      "Everything in Growth",
      "Unlimited transactions",
      "Unlimited user access",
      "Dedicated relationship manager",
      "Cash management services",
      "International payments",
      "API access",
    ],
  },
  {
    id: "industry",
    name: "Industry Specific",
    tagline: "Tailored for your sector",
    monthlyFee: "Custom",
    transactionLimit: "Custom",
    icon: <Factory className="w-6 h-6" />,
    color: "bg-amber-500",
    idealFor: "Healthcare, Real Estate, etc.",
    features: [
      "Industry-specific features",
      "Regulatory compliance support",
      "Specialized reporting",
      "Custom credit facilities",
      "Escrow services",
      "White-glove service",
    ],
  },
];

// ========================
// ACCOUNT BENEFITS
// ========================
const accountBenefits = [
  { icon: Zap, title: "Quick Setup", description: "Open in 10 minutes" },
  { icon: Shield, title: "FDIC Insured", description: "Up to $250,000" },
  { icon: Clock, title: "24/7 Banking", description: "Anytime access" },
  { icon: Star, title: "No Hidden Fees", description: "Transparent pricing" },
];

// ========================
// ACCOUNT CARD COMPONENT
// ========================
interface AccountCardProps {
  account: BusinessAccount;
  index: number;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-6 rounded-2xl bg-white border",
      account.popular
        ? "border-emerald-200 shadow-xl ring-2 ring-emerald-500"
        : "border-neutral-200 hover:shadow-lg hover:border-neutral-300",
      "transition-all duration-300"
    )}
  >
    {/* Popular Badge */}
    {account.popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
          <Star className="w-3 h-3" />
          Most Popular
        </span>
      </div>
    )}

    {/* Header */}
    <div className="flex items-start gap-4 mb-4">
      <div className={cn("p-3 rounded-xl text-white", account.color)}>
        {account.icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">{account.name}</h3>
        <p className="text-sm text-neutral-500">{account.tagline}</p>
      </div>
    </div>

    {/* Ideal For */}
    <div className="mb-4">
      <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
        Ideal for: {account.idealFor}
      </span>
    </div>

    {/* Pricing */}
    <div className="py-4 border-y border-neutral-100 mb-4">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-neutral-900">{account.monthlyFee}</span>
        <span className="text-sm text-neutral-500">/month</span>
      </div>
      <p className="text-xs text-neutral-400 mt-1">
        Transactions: {account.transactionLimit}
      </p>
    </div>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {account.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button
      variant={account.popular ? "primary" : "outline"}
      className={cn(
        "w-full",
        account.popular && "bg-emerald-600 hover:bg-emerald-700"
      )}
    >
      {account.monthlyFee === "Custom" ? "Contact Sales" : "Open Account"}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const BusinessAccounts: React.FC = () => {
  return (
    <Section id="business-accounts" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Business Accounts
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Choose The Right Account For Your Business
          </h2>
          <p className="text-lg text-neutral-600">
            From sole proprietors to large enterprises, we have business banking 
            solutions that scale with your company's needs.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {accountBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessAccounts.map((account, index) => (
            <AccountCard key={account.id} account={account} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default BusinessAccounts;
