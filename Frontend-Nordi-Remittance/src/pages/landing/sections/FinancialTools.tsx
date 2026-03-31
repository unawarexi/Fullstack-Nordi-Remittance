// ============================================================================
// FINANCIAL TOOLS SECTION - Calculators and financial tools preview
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  PiggyBank,
  Home,
  Car,
  TrendingUp,
  Percent,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// TOOLS DATA
// ========================
interface Tool {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  highlight?: string;
}

const tools: Tool[] = [
  {
    icon: <Home className="w-6 h-6" />,
    title: "Mortgage Calculator",
    description: "Calculate monthly payments and total interest",
    href: "/calculators/mortgage",
    highlight: "Most Popular",
  },
  {
    icon: <Car className="w-6 h-6" />,
    title: "Auto Loan Calculator",
    description: "Find out how much car you can afford",
    href: "/calculators/auto",
  },
  {
    icon: <PiggyBank className="w-6 h-6" />,
    title: "Savings Calculator",
    description: "Plan your savings goals and track growth",
    href: "/calculators/savings",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Investment Calculator",
    description: "Project your investment returns over time",
    href: "/calculators/investment",
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    title: "Budget Planner",
    description: "Create and manage your monthly budget",
    href: "/tools/budget",
  },
  {
    icon: <Percent className="w-6 h-6" />,
    title: "CD Calculator",
    description: "Compare CD rates and earnings",
    href: "/calculators/cd",
  },
];

// ========================
// MINI CALCULATOR PREVIEW
// ========================
const MiniCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = React.useState(250000);
  const monthlyPayment = Math.round((loanAmount * 0.065) / 12 + loanAmount / 360);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Quick Estimate</h4>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
            Loan Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className={cn(
                "w-full pl-9 pr-4 py-2.5 rounded-lg",
                "border border-neutral-200 dark:border-neutral-700 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
          <div>
            <div className="text-xs text-indigo-600">Est. Monthly Payment</div>
            <div className="text-xl font-bold text-indigo-700">
              ${monthlyPayment.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-right">
            <div>30-year fixed</div>
            <div>6.5% APR</div>
          </div>
        </div>

        <a
          href="/calculators/mortgage"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg",
            "bg-indigo-600 text-white text-sm font-medium",
            "hover:bg-indigo-700 transition-colors"
          )}
        >
          Get Full Estimate
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

// ========================
// TOOL CARD COMPONENT
// ========================
interface ToolCardProps {
  tool: Tool;
  index: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index }) => (
  <motion.a
    href={tool.href}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className={cn(
      "group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-700 transition-all"
    )}
  >
    {tool.highlight && (
      <span className="absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-medium text-white bg-amber-50 dark:bg-amber-900/200 rounded-full">
        {tool.highlight}
      </span>
    )}
    
    <div
      className={cn(
        "flex-shrink-0 p-2.5 rounded-lg",
        "bg-neutral-50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300",
        "group-hover:bg-indigo-50 dark:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors"
      )}
    >
      {tool.icon}
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-neutral-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
        {tool.title}
      </h4>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
        {tool.description}
      </p>
    </div>
    
    <ArrowRight
      className={cn(
        "w-4 h-4 text-neutral-300 flex-shrink-0 mt-1",
        "group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
      )}
    />
  </motion.a>
);

// ========================
// MAIN COMPONENT
// ========================
const FinancialTools: React.FC = () => {
  return (
    <Section background="white" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Left - Tools List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3 sm:mb-4">
                <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Financial Tools
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                Plan Your Financial Future
              </h2>
              <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-300">
                Use our free calculators and tools to make informed financial decisions.
              </p>
            </motion.div>

            {/* Tools Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map((tool, index) => (
                <ToolCard key={tool.title} tool={tool} index={index} />
              ))}
            </div>

            {/* View All */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <a
                href="/tools"
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-indigo-600",
                  "hover:text-indigo-700 transition-colors"
                )}
              >
                View All Financial Tools
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Right - Mini Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <MiniCalculator />

            {/* Tip Card */}
            <div className={cn(
              "p-5 rounded-xl",
              "bg-emerald-50 border border-emerald-100"
            )}>
              <h4 className="font-semibold text-emerald-900 text-sm">
                💡 Financial Tip
              </h4>
              <p className="mt-2 text-sm text-emerald-700 leading-relaxed">
                Aim to save at least 20% of your income. Start with a small amount and
                increase it gradually as you adjust your budget.
              </p>
              <a
                href="/learn/saving-tips"
                className="inline-block mt-3 text-sm font-medium text-emerald-600 hover:underline"
              >
                More saving tips →
              </a>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default FinancialTools;
