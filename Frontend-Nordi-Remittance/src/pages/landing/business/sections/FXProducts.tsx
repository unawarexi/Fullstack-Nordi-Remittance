// ============================================================================
// FX PRODUCTS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  ArrowLeftRight,
  TrendingUp,
  Shield,
  ArrowRight,
  Check,
  Clock,
  Banknote,
  LineChart,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// FX PRODUCTS DATA
// ========================
interface FXProduct {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  bestFor: string;
}

const fxProducts: FXProduct[] = [
  {
    id: "spot",
    name: "Spot FX",
    description: "Immediate currency exchange at current market rates",
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: "bg-blue-500",
    bestFor: "Immediate payments",
    features: [
      "Real-time exchange rates",
      "Competitive spreads",
      "Same-day settlement",
      "Major & exotic currencies",
    ],
  },
  {
    id: "forward",
    name: "Forward Contracts",
    description: "Lock in exchange rates for future transactions",
    icon: <Clock className="w-6 h-6" />,
    color: "bg-emerald-500",
    bestFor: "Budget certainty",
    features: [
      "Lock rates up to 2 years",
      "Hedge against volatility",
      "Flexible maturity dates",
      "Partial drawdowns allowed",
    ],
  },
  {
    id: "options",
    name: "FX Options",
    description: "Flexible hedging with right but not obligation to exchange",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-violet-500",
    bestFor: "Maximum flexibility",
    features: [
      "Protection with upside potential",
      "Custom strike prices",
      "Various option strategies",
      "Premium-based pricing",
    ],
  },
  {
    id: "swaps",
    name: "Currency Swaps",
    description: "Exchange currencies and reverse at a future date",
    icon: <LineChart className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    bestFor: "Liquidity management",
    features: [
      "Short & long-term swaps",
      "Interest rate arbitrage",
      "Balance sheet management",
      "Cross-currency funding",
    ],
  },
];

// ========================
// LIVE RATES
// ========================
const liveRates = [
  { pair: "EUR/USD", rate: "1.0850", change: "+0.15%" },
  { pair: "GBP/USD", rate: "1.2650", change: "+0.22%" },
  { pair: "USD/JPY", rate: "149.50", change: "-0.10%" },
  { pair: "USD/NGN", rate: "1,550.00", change: "+0.05%" },
];

// ========================
// PRODUCT CARD COMPONENT
// ========================
interface ProductCardProps {
  product: FXProduct;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
    )}
  >
    {/* Icon */}
    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4", product.color)}>
      {product.icon}
    </div>

    {/* Content */}
    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{product.name}</h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{product.description}</p>

    {/* Best For Badge */}
    <span className="inline-block px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full mb-4 w-fit">
      Best for: {product.bestFor}
    </span>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {product.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
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
const FXProducts: React.FC = () => {
  return (
    <Section id="fx-products" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            FX Products
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Foreign Exchange Solutions
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Manage currency risk and optimize your international transactions with 
            our comprehensive suite of FX products.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fxProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Live Rates Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-slate-900 text-white sticky top-24"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Live FX Rates</h3>
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="space-y-4">
                {liveRates.map((rate) => (
                  <div
                    key={rate.pair}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <span className="font-medium">{rate.pair}</span>
                    <div className="text-right">
                      <p className="font-bold">{rate.rate}</p>
                      <p className={cn(
                        "text-xs",
                        rate.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
                      )}>
                        {rate.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-4">
                  Rates are indicative only. Contact our FX desk for live quotes.
                </p>
                <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700">
                  Contact FX Desk
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/200/10 border border-amber-500/20">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Hedging Advisory</p>
                    <p className="text-xs text-slate-400">Get expert FX risk management advice</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default FXProducts;
