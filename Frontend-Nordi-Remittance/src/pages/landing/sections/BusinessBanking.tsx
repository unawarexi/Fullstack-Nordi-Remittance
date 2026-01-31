// ============================================================================
// BUSINESS BANKING SECTION - Business solutions overview
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Briefcase,
  Users,
  CreditCard,
  LineChart,
  Globe,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// BUSINESS SOLUTIONS DATA
// ========================
interface Solution {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const solutions: Solution[] = [
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Business Accounts",
    description: "Checking and savings built for business",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Merchant Services",
    description: "Accept payments anywhere",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Payroll Solutions",
    description: "Pay employees seamlessly",
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    title: "Business Lending",
    description: "Capital when you need it",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "International Trade",
    description: "Go global with confidence",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: "Treasury Management",
    description: "Optimize your cash flow",
  },
];

const benefits = [
  "Dedicated business advisors",
  "No minimum balance requirements",
  "Free business debit cards",
  "Integration with accounting software",
  "Multi-user access controls",
  "Real-time transaction alerts",
];

// ========================
// MAIN COMPONENT
// ========================
const BusinessBanking: React.FC = () => {
  return (
    <Section background="dark" className="py-12 lg:py-16 bg-slate-900">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-full mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              Business Banking
            </span>

            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Powerful Tools for Growing Businesses
            </h2>

            <p className="mt-3 text-slate-400 leading-relaxed">
              From startups to enterprises, we provide the financial solutions you need
              to scale your business. Let us handle your banking so you can focus on growth.
            </p>

            {/* Benefits List */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/business"
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-indigo-600 text-white font-medium text-sm",
                  "hover:bg-indigo-700 transition-colors"
                )}
              >
                Explore Business Solutions
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/business/contact"
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-slate-800 text-white font-medium text-sm",
                  "hover:bg-slate-700 transition-colors"
                )}
              >
                Talk to an Advisor
              </a>
            </div>
          </motion.div>

          {/* Right - Solutions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={cn(
                  "p-4 rounded-xl",
                  "bg-slate-800 border border-slate-700",
                  "hover:bg-slate-750 hover:border-slate-600 transition-all"
                )}
              >
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 w-fit mb-3">
                  {solution.icon}
                </div>
                <h4 className="font-medium text-white text-sm">{solution.title}</h4>
                <p className="mt-1 text-xs text-slate-400">{solution.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { value: "50K+", label: "Business clients" },
            { value: "$15B", label: "Business loans funded" },
            { value: "24/7", label: "Support availability" },
            { value: "97%", label: "Client satisfaction" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700"
            >
              <div className="text-2xl font-bold text-indigo-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default BusinessBanking;
