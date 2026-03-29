// ============================================================================
// TREASURY SERVICES SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  BarChart3,
  DollarSign,
  ArrowRight,
  Check,
  LineChart,
  Calculator,
  Percent,
  Activity,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// TREASURY PRODUCTS
// ========================
interface TreasuryProduct {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  badge?: string;
}

const treasuryProducts: TreasuryProduct[] = [
  {
    id: "fx-hedging",
    name: "FX Hedging Solutions",
    description: "Protect against currency volatility with sophisticated hedging strategies",
    icon: <DollarSign className="w-6 h-6" />,
    benefits: [
      "Forward contracts",
      "FX options & collars",
      "Cross-currency swaps",
      "Dynamic hedging programs",
    ],
    badge: "Most Popular",
  },
  {
    id: "interest-rate",
    name: "Interest Rate Management",
    description: "Manage interest rate exposure across your debt portfolio",
    icon: <Percent className="w-6 h-6" />,
    benefits: [
      "Interest rate swaps",
      "Caps & floors",
      "Swaptions",
      "Liability management",
    ],
  },
  {
    id: "commodity",
    name: "Commodity Hedging",
    description: "Mitigate commodity price risk for raw materials",
    icon: <Activity className="w-6 h-6" />,
    benefits: [
      "Energy derivatives",
      "Agricultural products",
      "Metals hedging",
      "Structured solutions",
    ],
  },
  {
    id: "investments",
    name: "Treasury Investments",
    description: "Optimize returns on excess cash and liquidity",
    icon: <LineChart className="w-6 h-6" />,
    benefits: [
      "Money market funds",
      "Time deposits",
      "Commercial paper",
      "Short-term bonds",
    ],
  },
];

// ========================
// MARKET INSIGHTS
// ========================
const marketInsights = [
  { pair: "EUR/USD", rate: "1.0854", change: "+0.12%", trend: "up" },
  { pair: "GBP/USD", rate: "1.2642", change: "-0.08%", trend: "down" },
  { pair: "USD/JPY", rate: "149.32", change: "+0.24%", trend: "up" },
  { pair: "USD/NGN", rate: "1,512.50", change: "+0.05%", trend: "up" },
];

// ========================
// MAIN COMPONENT
// ========================
const TreasuryServices: React.FC = () => {
  return (
    <Section id="treasury-services" className="py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Treasury Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Risk Management & Treasury Solutions
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Expert treasury services to help you manage financial risks, optimize 
            investments, and implement sophisticated hedging strategies.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {treasuryProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={cn(
                  "relative p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                  "hover:shadow-md hover:border-amber-300 transition-all duration-300"
                )}
              >
                {product.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    {product.badge}
                  </span>
                )}
                
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  {product.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{product.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{product.description}</p>
                
                <ul className="space-y-1.5">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Market Insights Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Live Rates */}
            <div className="p-5 rounded-xl bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Live FX Rates</h4>
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
              
              <div className="space-y-3">
                {marketInsights.map((insight) => (
                  <div
                    key={insight.pair}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <span className="font-medium">{insight.pair}</span>
                    <div className="text-right">
                      <p className="font-semibold">{insight.rate}</p>
                      <p className={cn(
                        "text-xs",
                        insight.trend === "up" ? "text-emerald-400" : "text-red-400"
                      )}>
                        {insight.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10 text-sm">
                View All Rates
              </Button>
            </div>

            {/* Risk Assessment */}
            <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white">Risk Assessment</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Free consultation</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                Get a comprehensive analysis of your currency and interest rate exposures 
                with recommended hedging strategies.
              </p>
              <Button variant="primary" className="w-full bg-amber-600 hover:bg-amber-700 text-sm">
                Request Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Research */}
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Market Research</h4>
              <ul className="space-y-3">
                {[
                  "Q4 FX Outlook Report",
                  "Interest Rate Forecast",
                  "Commodity Market Brief",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-amber-600"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {item}
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default TreasuryServices;
