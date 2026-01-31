// ============================================================================
// CASH MANAGEMENT SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  Users,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Clock,
  Globe,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CASH MANAGEMENT SERVICES
// ========================
interface CashService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const cashServices: CashService[] = [
  {
    id: "collections",
    name: "Collections Management",
    description: "Streamline receivables and accelerate cash collection",
    icon: <Receipt className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Virtual account numbers",
      "Direct debit services",
      "Real-time collection reports",
      "Automatic reconciliation",
      "Multi-channel collections",
    ],
  },
  {
    id: "payments",
    name: "Payment Solutions",
    description: "Efficient disbursement to suppliers and employees",
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "Bulk payment processing",
      "Scheduled payments",
      "Payroll management",
      "Vendor payment portal",
      "Multi-currency payments",
    ],
  },
  {
    id: "liquidity",
    name: "Liquidity Management",
    description: "Optimize cash positions across accounts",
    icon: <Wallet className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "Cash pooling",
      "Notional pooling",
      "Sweep accounts",
      "Overnight investments",
      "Intercompany netting",
    ],
  },
  {
    id: "reporting",
    name: "Reporting & Analytics",
    description: "Comprehensive visibility into cash positions",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-amber-500",
    features: [
      "Real-time balance reporting",
      "Cash flow forecasting",
      "Custom dashboards",
      "API integration",
      "Audit trail",
    ],
  },
];

// ========================
// PLATFORM BENEFITS
// ========================
const platformBenefits = [
  { icon: Zap, title: "Real-Time Processing", description: "Instant transactions" },
  { icon: Shield, title: "Bank-Grade Security", description: "Multi-layer protection" },
  { icon: Globe, title: "Global Reach", description: "100+ countries" },
  { icon: Clock, title: "24/7 Access", description: "Always available" },
];

// ========================
// SERVICE CARD COMPONENT
// ========================
interface ServiceCardProps {
  service: CashService;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => (
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
    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", service.color)}>
      {service.icon}
    </div>

    {/* Content */}
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{service.name}</h3>
    <p className="text-sm text-neutral-500 mb-4">{service.description}</p>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {service.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="outline" className="w-full">
      Learn More
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const CashManagement: React.FC = () => {
  return (
    <Section id="cash-management" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Wallet className="w-4 h-4" />
            Cash Management
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Optimize Your Business Cash Flow
          </h2>
          <p className="text-lg text-neutral-600">
            Comprehensive cash management solutions to help you collect faster, 
            pay smarter, and gain complete visibility into your liquidity position.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {platformBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-violet-50 border border-violet-100"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cashServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Platform Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-slate-900 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Nordea Treasury Platform</h3>
              <p className="text-slate-300 mb-6">
                Our integrated treasury management platform gives you complete control 
                over your cash positions, payments, and collections - all from a single, 
                secure interface.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Single sign-on for all cash management services",
                  "Role-based access with multi-level approvals",
                  "ERP integration via API or file upload",
                  "Mobile app for on-the-go management",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                    <Check className="w-5 h-5 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="bg-violet-600 hover:bg-violet-700">
                Request Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-3xl font-bold text-amber-400">$50B+</p>
                <p className="text-xs text-slate-400">Daily transaction volume</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-3xl font-bold text-amber-400">99.9%</p>
                <p className="text-xs text-slate-400">Platform uptime</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-3xl font-bold text-amber-400">10K+</p>
                <p className="text-xs text-slate-400">Corporate clients</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-3xl font-bold text-amber-400">180+</p>
                <p className="text-xs text-slate-400">Currencies supported</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CashManagement;
