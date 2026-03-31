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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-12 sm:mb-20">
          {investmentStrategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative p-5 sm:p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all duration-500",
                "hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1"
              )}
            >
              <div className="flex items-start justify-between mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-400/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  {React.isValidElement(strategy.icon) 
                    ? React.cloneElement(strategy.icon as React.ReactElement, { className: "w-6 h-6 sm:w-8 sm:h-8" })
                    : strategy.icon}
                </div>
                <span className={cn("px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest", riskColors[strategy.risk])}>
                  {strategy.risk}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-2 sm:mb-3 uppercase tracking-tight">{strategy.name}</h3>
              <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6 sm:mb-8 leading-relaxed font-medium">{strategy.description}</p>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 mb-6 sm:mb-8 border border-neutral-100 dark:border-neutral-700 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest">Target Returns</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums">{strategy.returns}</span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {strategy.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    </div>
                    <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 font-bold">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full py-4 rounded-2xl border-2 font-bold group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-all">
                Explore Strategy
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
            className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-8 sm:mb-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center shadow-lg">
                <PieChart className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Portfolio Allocation</h4>
            </div>

            <div className="flex items-center justify-center mb-10 sm:mb-16">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center group">
                    <p className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tighter group-hover:scale-110 transition-transform">$1M+</p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest mt-1">Min. Investment</p>
                  </div>
                </div>
                <svg className="w-full h-full -rotate-90 filter drop-shadow-2xl" viewBox="0 0 100 100">
                  {assetClasses.map((asset, i) => {
                    const offset = assetClasses.slice(0, i).reduce((sum, a) => sum + parseInt(a.allocation), 0);
                    const value = parseInt(asset.allocation);
                    return (
                      <circle
                        key={asset.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        className={cn(asset.color.replace('bg-', 'text-'), "transition-all duration-700 hover:stroke-amber-400 cursor-pointer")}
                        strokeWidth="15"
                        strokeDasharray={`${value} ${100 - value}`}
                        strokeDashoffset={-offset}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {assetClasses.map((asset) => (
                <div key={asset.name} className="flex flex-col p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700 group hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", asset.color)} />
                    <span className="text-[10px] sm:text-[11px] font-black text-neutral-500 uppercase tracking-tighter truncate">{asset.name}</span>
                  </div>
                  <span className="text-sm sm:text-lg font-black text-neutral-900 dark:text-white tabular-nums">{asset.allocation}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Advisory Services */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 sm:mb-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">Advisory Excellence</h4>
              </div>

              <p className="text-sm sm:text-lg text-emerald-100/80 mb-8 sm:mb-12 font-medium leading-relaxed">
                Our team of <span className="text-emerald-400 font-black">CFA-certified</span> investment professionals work closely 
                with you to build and manage portfolios aligned with your goals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
                {[
                  { icon: Target, title: "Goal-Based", desc: "Life-centered investing" },
                  { icon: RefreshCw, title: "Active Alpha", desc: "Dynamic rebalancing" },
                  { icon: Globe, title: "Global Reach", desc: "Multi-market access" },
                  { icon: LineChart, title: "Deep Analytics", desc: "Quarterly forensic audits" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <p className="font-black text-[13px] sm:text-sm uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{item.title}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full bg-emerald-400 hover:bg-emerald-500 text-neutral-900 font-bold py-4 px-10 shadow-xl shadow-emerald-400/20 relative z-10">
              Schedule Consultation
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default InvestmentManagement;
