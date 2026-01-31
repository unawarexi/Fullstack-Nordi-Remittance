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
    <Section id="distributors-forum" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Distributors Forum
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Empowering Distribution Networks
          </h2>
          <p className="text-lg text-neutral-600">
            Exclusive financing and support programs for authorized distributors 
            of our principal partners, designed to grow your business.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {forumStats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-orange-50 border border-orange-100"
            >
              <p className="text-2xl lg:text-3xl font-bold text-orange-600">{stat.value}</p>
              <p className="text-sm text-neutral-600 mt-1">{stat.label}</p>
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
                "relative p-6 rounded-2xl bg-white border border-neutral-200",
                "hover:shadow-lg hover:border-orange-300 transition-all duration-300"
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">{benefit.name}</h3>
              <p className="text-sm text-neutral-500 mb-4">{benefit.description}</p>
              
              <ul className="space-y-2">
                {benefit.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-neutral-600">{feature}</span>
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
          className="p-6 rounded-2xl bg-slate-50 border border-slate-100 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h4 className="font-semibold text-neutral-900">Principal Partners</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {principalPartners.map((partner) => (
              <span
                key={partner}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-neutral-700"
              >
                {partner}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
              +40 more
            </span>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Join the Forum</h3>
              <p className="text-orange-100 mb-6">
                If you're an authorized distributor of any of our principal partners, 
                you're eligible to join the Distributors Forum and access exclusive benefits.
              </p>

              <div className="space-y-4 mb-6">
                {[
                  { icon: Shield, text: "Principal verification & endorsement" },
                  { icon: Clock, text: "Quick 48-hour facility approval" },
                  { icon: BadgePercent, text: "Preferential rates & terms" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button variant="primary" className="bg-white text-orange-600 hover:bg-orange-50">
                Apply for Membership
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold mb-4">Quick Eligibility Check</h4>
                <ul className="space-y-3">
                  {[
                    "Valid distributor agreement",
                    "Minimum 1 year in distribution",
                    "Good credit history",
                    "Principal recommendation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-400 text-white flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                      <span className="text-sm">{item}</span>
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
