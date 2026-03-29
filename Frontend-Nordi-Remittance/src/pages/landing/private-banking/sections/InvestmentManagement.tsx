// ============================================================================
// INVESTMENT MANAGEMENT SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  ArrowRight,
  Check,
  Shield,
  Globe,
  Leaf,
  Target,
  RefreshCw,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// INVESTMENT STRATEGIES
// ========================
interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  returns: string;
  risk: "Conservative" | "Moderate" | "Aggressive";
  features: string[];
}

const investmentStrategies: InvestmentStrategy[] = [
  {
    id: "capital-preservation",
    name: "Capital Preservation",
    description: "Focus on protecting wealth with steady, stable returns",
    icon: <Shield className="w-6 h-6" />,
    returns: "4-6% p.a.",
    risk: "Conservative",
    features: ["Fixed income focus", "Low volatility", "Capital protection", "Income generation"],
  },
  {
    id: "balanced-growth",
    name: "Balanced Growth",
    description: "Optimal mix of growth and income for moderate risk tolerance",
    icon: <BarChart3 className="w-6 h-6" />,
    returns: "7-10% p.a.",
    risk: "Moderate",
    features: ["Diversified portfolio", "60/40 allocation", "Tactical rebalancing", "Multi-asset exposure"],
  },
  {
    id: "aggressive-growth",
    name: "Aggressive Growth",
    description: "Maximum capital appreciation for long-term investors",
    icon: <TrendingUp className="w-6 h-6" />,
    returns: "12-15%+ p.a.",
    risk: "Aggressive",
    features: ["Equity focus", "Emerging markets", "Alternative investments", "High growth sectors"],
  },
  {
    id: "sustainable",
    name: "Sustainable Investing",
    description: "ESG-focused investments aligning values with returns",
    icon: <Leaf className="w-6 h-6" />,
    returns: "8-12% p.a.",
    risk: "Moderate",
    features: ["ESG screening", "Impact measurement", "Thematic investing", "Green bonds"],
  },
];

// ========================
// RISK COLORS
// ========================
const riskColors = {
  Conservative: "bg-emerald-100 text-emerald-700",
  Moderate: "bg-amber-100 text-amber-700 dark:text-amber-300",
  Aggressive: "bg-rose-100 text-rose-700",
};

// ========================
// ASSET CLASSES
// ========================
const assetClasses = [
  { name: "Global Equities", allocation: "35%", color: "bg-blue-500" },
  { name: "Fixed Income", allocation: "25%", color: "bg-emerald-500" },
  { name: "Real Estate", allocation: "15%", color: "bg-amber-50 dark:bg-amber-900/200" },
  { name: "Private Equity", allocation: "10%", color: "bg-violet-500" },
  { name: "Alternatives", allocation: "10%", color: "bg-rose-500" },
  { name: "Cash", allocation: "5%", color: "bg-neutral-400" },
];

// ========================
// MAIN COMPONENT
// ========================
const InvestmentManagement: React.FC = () => {
  return (
    <Section id="investment-management" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Investment Management
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Grow & Protect Your Wealth
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Sophisticated investment strategies managed by our team of experts, 
            tailored to your risk profile and financial goals.
          </p>
        </motion.div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {investmentStrategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-emerald-300 transition-all duration-300"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  {strategy.icon}
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium", riskColors[strategy.risk])}>
                  {strategy.risk}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{strategy.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{strategy.description}</p>

              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Target Returns</span>
                  <span className="text-lg font-bold text-emerald-600">{strategy.returns}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {strategy.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full group-hover:border-emerald-500 group-hover:text-emerald-600">
                Explore Strategy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Portfolio Allocation & Advisory */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Portfolio Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-neutral-900 dark:text-white">Sample Portfolio Allocation</h4>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">$1M+</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Min. Investment</p>
                  </div>
                </div>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {assetClasses.reduce((acc, asset, i) => {
                    const prev = i === 0 ? 0 : acc;
                    const value = parseInt(asset.allocation);
                    const strokeDasharray = `${value} ${100 - value}`;
                    const strokeDashoffset = -prev;
                    return (
                      <>
                        <circle
                          key={asset.name}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="currentColor"
                          className={asset.color.replace('bg-', 'text-')}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                        {prev + value}
                      </>
                    );
                  }, 0)}
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {assetClasses.map((asset) => (
                <div key={asset.name} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", asset.color)} />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">{asset.name}</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white ml-auto">{asset.allocation}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Advisory Services */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-emerald-900 text-white"
          >
            <h4 className="text-xl font-semibold mb-4">Investment Advisory Services</h4>
            <p className="text-emerald-200 mb-6">
              Our team of CFA-certified investment professionals work closely 
              with you to build and manage portfolios aligned with your goals.
            </p>

            <div className="space-y-4 mb-6">
              {[
                { icon: Target, title: "Goal-Based Planning", desc: "Align investments with life goals" },
                { icon: RefreshCw, title: "Active Management", desc: "Regular portfolio rebalancing" },
                { icon: Globe, title: "Global Access", desc: "International markets & products" },
                { icon: LineChart, title: "Performance Reporting", desc: "Detailed quarterly reviews" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-emerald-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 text-neutral-900 dark:text-white">
              Schedule Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default InvestmentManagement;
