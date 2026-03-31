// ============================================================================
// DISTRIBUTORS FORUM SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Truck,
  Package,
  Wallet,
  ArrowRight,
  Check,
  Shield,
  Clock,
  BadgePercent,
  FileText,
  Building2,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// FORUM BENEFITS
// ========================
interface ForumBenefit {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const forumBenefits: ForumBenefit[] = [
  {
    id: "financing",
    name: "Distributor Financing",
    description: "Access working capital tied to your distribution agreements",
    icon: <Wallet className="w-6 h-6" />,
    features: [
      "Up to 90-day credit facilities",
      "Competitive interest rates",
      "Principal-backed guarantees",
      "Quick disbursement",
    ],
  },
  {
    id: "inventory",
    name: "Inventory Financing",
    description: "Finance your stock purchases with flexible payment terms",
    icon: <Package className="w-6 h-6" />,
    features: [
      "Stock financing up to 80%",
      "Warehouse receipts",
      "Consignment support",
      "Seasonal adjustments",
    ],
  },
  {
    id: "logistics",
    name: "Fleet & Logistics",
    description: "Vehicle and logistics financing for distribution networks",
    icon: <Truck className="w-6 h-6" />,
    features: [
      "Vehicle acquisition",
      "Lease-to-own options",
      "Fleet insurance",
      "Maintenance financing",
    ],
  },
  {
    id: "digital",
    name: "Digital Tools",
    description: "Technology solutions for efficient distribution management",
    icon: <FileText className="w-6 h-6" />,
    features: [
      "Order management",
      "Inventory tracking",
      "Payment reconciliation",
      "Reporting dashboards",
    ],
  },
];

// ========================
// PRINCIPAL PARTNERS
// ========================
const principalPartners = [
  "Unilever", "Nestle", "P&G", "Coca-Cola", "PZ Cussons", "Dangote",
  "Nigerian Breweries", "Flour Mills", "BUA", "Honeywell",
];

// ========================
// STATS
// ========================
const forumStats = [
  { value: "5,000+", label: "Active Distributors" },
  { value: "$500M+", label: "Annual Financing" },
  { value: "50+", label: "Principal Partners" },
  { value: "98%", label: "Approval Rate" },
];

// ========================
// MAIN COMPONENT
// ========================
const DistributorsForum: React.FC = () => {
  return (
    <Section id="distributors-forum" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Distributors Forum
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Empowering Distribution Networks
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Exclusive financing and support programs for authorized distributors 
            of our principal partners, designed to grow your business.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {forumStats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 sm:p-4 rounded-xl bg-orange-50 dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800"
            >
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {forumBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-orange-300 transition-all duration-300 flex flex-col"
              )}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                {React.cloneElement(benefit.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 leading-tight">{benefit.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-4 sm:mb-5 leading-relaxed">{benefit.description}</p>
              
              <ul className="space-y-1.5 sm:space-y-2 mt-auto">
                {benefit.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Principal Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 sm:p-8 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
            <h4 className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">Principal Partners</h4>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {principalPartners.map((partner) => (
              <span
                key={partner}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-[11px] sm:text-sm text-neutral-700 dark:text-neutral-200 font-medium"
              >
                {partner}
              </span>
            ))}
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[11px] sm:text-sm font-bold">
              +40 more
            </span>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 leading-tight">Join the Forum</h3>
              <p className="text-sm sm:text-lg text-orange-100 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                If you're an authorized distributor of any of our principal partners, 
                you're eligible to join the Distributors Forum and access exclusive benefits.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {[
                  { icon: Shield, text: "Principal verification & endorsement" },
                  { icon: Clock, text: "Quick 48-hour facility approval" },
                  { icon: BadgePercent, text: "Preferential rates & terms" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[13px] sm:text-base font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-white dark:bg-neutral-800 text-orange-600 hover:bg-orange-50 text-sm py-2.5 sm:py-3 px-8">
                Apply for Membership
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>

            <div className="block lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20">
                <h4 className="font-bold mb-4 text-sm sm:text-base uppercase tracking-wider">Quick Eligibility Check</h4>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "Valid distributor agreement",
                    "Minimum 1 year in distribution",
                    "Good credit history",
                    "Principal recommendation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-400 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 shadow-lg">
                        {i + 1}
                      </div>
                      <span className="text-[13px] sm:text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default DistributorsForum;
