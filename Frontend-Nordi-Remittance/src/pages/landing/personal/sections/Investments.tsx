// ============================================================================
// INVESTMENTS SECTION - Personal Banking
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Shield,
  Target,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Clock,
  Award,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// INVESTMENT OPTIONS DATA
// ========================
interface InvestmentOption {
  id: string;
  name: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  expectedReturn: string;
  minInvestment: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const investmentOptions: InvestmentOption[] = [
  {
    id: "mutual-funds",
    name: "Mutual Funds",
    description: "Professionally managed diversified portfolios",
    riskLevel: "Medium",
    expectedReturn: "8-12%",
    minInvestment: "$500",
    icon: <PieChart className="w-6 h-6" />,
    color: "bg-indigo-500",
    features: [
      "Professional fund management",
      "Diversified portfolio",
      "Regular dividend payouts",
      "Easy liquidity",
    ],
  },
  {
    id: "stocks",
    name: "Stock Trading",
    description: "Direct equity investments with expert guidance",
    riskLevel: "High",
    expectedReturn: "10-20%",
    minInvestment: "$100",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "Zero commission trades",
      "Real-time market data",
      "Research & analysis tools",
      "Mobile trading app",
    ],
  },
  {
    id: "bonds",
    name: "Bonds & Fixed Income",
    description: "Stable returns with capital preservation",
    riskLevel: "Low",
    expectedReturn: "4-6%",
    minInvestment: "$1,000",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-blue-500",
    features: [
      "Government & corporate bonds",
      "Regular interest payments",
      "Capital preservation",
      "Tax-efficient options",
    ],
  },
  {
    id: "retirement",
    name: "Retirement Planning",
    description: "Secure your future with tax-advantaged accounts",
    riskLevel: "Medium",
    expectedReturn: "7-10%",
    minInvestment: "$50",
    icon: <Target className="w-6 h-6" />,
    color: "bg-amber-500",
    features: [
      "401(k) and IRA options",
      "Tax-deferred growth",
      "Employer matching",
      "Retirement calculators",
    ],
  },
];

// ========================
// WHY INVEST WITH US
// ========================
const investmentBenefits = [
  {
    icon: Award,
    title: "Expert Advisors",
    description: "Access to certified financial planners",
  },
  {
    icon: BarChart3,
    title: "Advanced Tools",
    description: "Professional-grade analysis & research",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Real-time portfolio tracking",
  },
  {
    icon: Briefcase,
    title: "Diverse Options",
    description: "Wide range of investment products",
  },
];

// ========================
// RISK BADGE COMPONENT
// ========================
const RiskBadge: React.FC<{ level: "Low" | "Medium" | "High" }> = ({ level }) => {
  const colors = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[level])}>
      {level} Risk
    </span>
  );
};

// ========================
// INVESTMENT CARD COMPONENT
// ========================
interface InvestmentCardProps {
  option: InvestmentOption;
  index: number;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ option, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "group relative p-6 rounded-2xl bg-white border border-neutral-200",
      "hover:shadow-xl hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-3 rounded-xl text-white", option.color)}>
        {option.icon}
      </div>
      <RiskBadge level={option.riskLevel} />
    </div>

    {/* Content */}
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{option.name}</h3>
    <p className="text-sm text-neutral-500 mb-4">{option.description}</p>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-100 mb-4">
      <div>
        <p className="text-xs text-neutral-400">Expected Return</p>
        <p className="text-lg font-bold text-emerald-600">{option.expectedReturn}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">Min. Investment</p>
        <p className="text-lg font-bold text-neutral-900">{option.minInvestment}</p>
      </div>
    </div>

    {/* Features */}
    <ul className="space-y-2 mb-6">
      {option.features.map((feature) => (
        <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
          <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          {feature}
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button variant="outline" className="w-full group-hover:bg-indigo-50 group-hover:border-indigo-200">
      Learn More
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const Investments: React.FC = () => {
  return (
    <Section id="investments" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Investment Solutions
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Build Wealth For Your Future
          </h2>
          <p className="text-lg text-neutral-600">
            From stocks and bonds to retirement planning, our investment solutions 
            are designed to help you grow your wealth and achieve financial freedom.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {investmentBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200"
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <benefit.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{benefit.title}</p>
                <p className="text-xs text-neutral-500">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Investment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {investmentOptions.map((option, index) => (
            <InvestmentCard key={option.id} option={option} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 rounded-2xl bg-indigo-900 text-white"
        >
          <h3 className="text-2xl font-bold mb-3">Ready to Start Investing?</h3>
          <p className="text-indigo-200 mb-6 max-w-xl mx-auto">
            Schedule a free consultation with our investment advisors and create a 
            personalized investment strategy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" className="bg-amber-500 hover:bg-amber-600">
              Schedule Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              View All Products
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Investments;
