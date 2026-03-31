// ============================================================================
// AGENCY BANKING SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Store,
  Users,
  DollarSign,
  ArrowRight,
  Check,
  MapPin,
  Shield,
  Zap,
  TrendingUp,
  Banknote,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// AGENT SERVICES
// ========================
interface AgentService {
  icon: React.ReactNode;
  name: string;
  description: string;
}

const agentServices: AgentService[] = [
  { icon: <Banknote className="w-5 h-5" />, name: "Cash Deposits", description: "Deposit cash to any bank account" },
  { icon: <DollarSign className="w-5 h-5" />, name: "Cash Withdrawals", description: "Withdraw from your account" },
  { icon: <CreditCard className="w-5 h-5" />, name: "Bill Payments", description: "Pay utilities and services" },
  { icon: <Smartphone className="w-5 h-5" />, name: "Airtime & Data", description: "Top up any network" },
];

// ========================
// BECOME AN AGENT BENEFITS
// ========================
const agentBenefits = [
  "Earn commission on every transaction",
  "Free POS terminal provided",
  "Comprehensive training and support",
  "Marketing materials included",
  "Dedicated relationship manager",
  "24/7 technical support",
];

// ========================
// AGENT STATS
// ========================
const agentStats = [
  { value: "50,000+", label: "Active Agents" },
  { value: "774", label: "LGAs Covered" },
  { value: "₦10B+", label: "Monthly Transactions" },
];

// ========================
// MAIN COMPONENT
// ========================
const AgencyBanking: React.FC = () => {
  return (
    <Section id="agency-banking" className="py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
            <Store className="w-4 h-4" />
            Agency Banking
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Banking at Your Doorstep
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Access banking services through our network of 50,000+ agents 
            located in markets, shops, and neighborhoods across Nigeria.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-12 sm:mb-20"
        >
          {agentStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-xl transition-all">
              <p className="text-xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums tracking-tighter">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-black uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-xl"
          >
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-8 uppercase tracking-tight">Nexus Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agentServices.map((service) => (
                <div
                  key={service.name}
                  className={cn(
                    "p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-transparent shadow-sm transition-all group",
                    "hover:bg-orange-500/5 hover:border-orange-500/20"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    {React.isValidElement(service.icon) 
                      ? React.cloneElement(service.icon as React.ReactElement, { className: "w-6 h-6" })
                      : service.icon}
                  </div>
                  <h4 className="font-black text-neutral-900 dark:text-white text-[15px] sm:text-base uppercase tracking-tight mb-1">{service.name}</h4>
                  <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>

            {/* Find Agent CTA */}
            <div className="mt-4 p-4 rounded-xl bg-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">Find Nearest Agent</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">Locate agents close to you</p>
                </div>
              </div>
              <Button variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Become an Agent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 text-white"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-xl font-bold">Become an Agent</h3>
            </div>
            <p className="text-orange-100 mb-6">
              Join our agent network and earn steady income by providing banking 
              services in your community. No banking experience required.
            </p>

            <ul className="space-y-3 mb-6">
              {agentBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Requirements */}
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm mb-4">
              <p className="font-semibold mb-2">Requirements:</p>
              <ul className="text-sm text-orange-100 space-y-1">
                <li>• Valid ID (NIN, Voter's Card, Driver's License)</li>
                <li>• Shop or designated business space</li>
                <li>• Minimum float of ₦50,000</li>
                <li>• Smartphone or basic mobile phone</li>
              </ul>
            </div>

            <Button variant="secondary" className="w-full bg-white dark:bg-neutral-800 text-orange-600 hover:bg-orange-50">
              <Users className="w-4 h-4 mr-2" />
              Apply to Become an Agent
            </Button>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-300"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Verified Agents Only</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <span>Instant Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-teal-600" />
            <span>CBN Licensed</span>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default AgencyBanking;
